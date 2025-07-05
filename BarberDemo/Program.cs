using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MimeKit.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Services ───────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDb>(opt => opt.UseInMemoryDatabase("BarberDemo"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<ReminderService>();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

// ── Seed demo data ─────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    if (!db.WorkingHours.Any())
    {
        db.WorkingHours.AddRange(
            new WorkingHour { Day = DayOfWeek.Monday,  Start = new(10, 0, 0), End = new(18, 0, 0) },
            new WorkingHour { Day = DayOfWeek.Tuesday, Start = new(10, 0, 0), End = new(18, 0, 0) }
        );
        db.SaveChanges();
    }
}

// ── Endpoints ──────────────────────────────────────────────────────────

// 1) Add working hours
app.MapPost("/api/hours", async (WorkingHourDto dto, AppDb db) =>
{
    if (TimeSpan.Parse(dto.Start) >= TimeSpan.Parse(dto.End))
        return Results.BadRequest("Start must be before End.");

    var overlaps = await db.WorkingHours.AnyAsync(h =>
        h.Day == dto.Day &&
        (TimeSpan.Parse(dto.Start) < h.End &&
         TimeSpan.Parse(dto.End)   > h.Start));

    if (overlaps) return Results.BadRequest("Overlapping working hours.");

    var hour = new WorkingHour
    {
        Day   = dto.Day,
        Start = TimeSpan.Parse(dto.Start),
        End   = TimeSpan.Parse(dto.End)
    };
    db.WorkingHours.Add(hour);
    await db.SaveChangesAsync();
    return Results.Created($"/api/hours/{hour.Id}", hour);
});

// 2) Book an appointment
app.MapPost("/api/appointments",
    async (AppointmentDto dto, AppDb db, IEmailService mail) =>
{
    var when = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);

    // inside working hours?
    bool within = await db.WorkingHours.AnyAsync(h =>
        h.Day == when.DayOfWeek &&
        when.TimeOfDay >= h.Start &&
        when.TimeOfDay <  h.End);

    if (!within)
        return Results.BadRequest("Time is outside working hours.");

    // no clash?
    bool clash = await db.Appointments.AnyAsync(a => a.Date == when);
    if (clash)
        return Results.BadRequest("Time slot already taken.");

    var appt = new Appointment
    {
        Customer = dto.Customer,
        Email    = dto.Email,
        Date     = when
    };
    db.Appointments.Add(appt);
    await db.SaveChangesAsync();

    // immediate notification e-mails
    await mail.SendAsync("barber@kral.com",
                         "New booking",
                         $"{appt.Customer} booked {appt.Date:u}");
    await mail.SendAsync(appt.Email,
                         "Booking confirmed",
                         $"Dear {appt.Customer}, your appointment is on {appt.Date:u}.");

    return Results.Ok(appt);
});

app.Run();

// ── Domain models ──────────────────────────────────────────────────────
class WorkingHour
{
    public int Id { get; set; }
    public DayOfWeek Day { get; set; }
    public TimeSpan  Start { get; set; }
    public TimeSpan  End   { get; set; }
}

class Appointment
{
    public int      Id           { get; set; }
    public string   Customer     { get; set; } = "";
    public string   Email        { get; set; } = "";
    public DateTime Date         { get; set; }
    public bool     ReminderSent { get; set; }
}

// ── Request DTOs ───────────────────────────────────────────────────────
record WorkingHourDto(DayOfWeek Day, string Start, string End);
record AppointmentDto(string Customer, string Email, DateTime Date);

// ── EF Core DbContext ──────────────────────────────────────────────────
class AppDb(DbContextOptions<AppDb> opts) : DbContext(opts)
{
    public DbSet<WorkingHour> WorkingHours => Set<WorkingHour>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
}

// ── E-mail service abstraction ────────────────────────────────────────
interface IEmailService
{
    Task SendAsync(string to, string subject, string body);
}

class EmailService(IConfiguration cfg, ILogger<EmailService> log) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
    {
        var mode = cfg["Mail:Mode"] ?? "console";

        // Console mode — demo default
        if (mode.Equals("console", StringComparison.OrdinalIgnoreCase))
        {
            log.LogInformation("MAIL ▶ {To} | {Subject}", to, subject);
            return;
        }

        // SMTP mode via MailKit
        var msg = new MimeMessage
        {
            Subject = subject,
            Body    = new TextPart(TextFormat.Plain) { Text = body }
        };
        msg.From.Add(MailboxAddress.Parse(cfg["Mail:Smtp:From"]!));
        msg.To  .Add(MailboxAddress.Parse(to));

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(cfg["Mail:Smtp:Host"],
                                int.Parse(cfg["Mail:Smtp:Port"]!),
                                SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(cfg["Mail:Smtp:User"],
                                     cfg["Mail:Smtp:Pass"]);
        await smtp.SendAsync(msg);
        await smtp.DisconnectAsync(true);
    }
}

// ── Background reminder job ───────────────────────────────────────────
class ReminderService(IServiceProvider sp, ILogger<ReminderService> log)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stop)
    {
        var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));   // demo cadence
        while (await timer.WaitForNextTickAsync(stop))
        {
            using var scope = sp.CreateScope();
            var db   = scope.ServiceProvider.GetRequiredService<AppDb>();
            var mail = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var now   = DateTime.UtcNow;
            var until = now.AddHours(24);

            var due = await db.Appointments
                              .Where(a => !a.ReminderSent &&
                                          a.Date >= now &&
                                          a.Date <= until)
                              .ToListAsync(stop);

            foreach (var appt in due)
            {
                await mail.SendAsync(appt.Email,
                    "Appointment reminder",
                    $"Reminder: your appointment is on {appt.Date:u}");
                appt.ReminderSent = true;
                log.LogInformation("Reminder sent for appointment {Id}", appt.Id);
            }
            await db.SaveChangesAsync(stop);
        }
    }
}
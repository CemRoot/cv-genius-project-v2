// Maintenance configuration that can be controlled via environment variables
// This allows easy control from Vercel dashboard without code changes

export interface MaintenanceSection {
  id: string
  name: string
  path: string
  isInMaintenance: boolean
  message: string
  estimatedTime: string
}

export interface MaintenanceConfig {
  globalMaintenance: boolean
  sections: MaintenanceSection[]
}

// Helper function to check environment variable as boolean
const isEnabled = (envVar: string | undefined): boolean => {
  return envVar === 'true' || envVar === '1' || envVar === 'yes'
}

// Get maintenance configuration from environment variables
export function getMaintenanceConfig(): MaintenanceConfig {
  return {
    globalMaintenance: isEnabled(process.env.NEXT_PUBLIC_GLOBAL_MAINTENANCE),
    sections: [
      {
        id: 'cv-builder',
        name: 'CV Builder',
        path: '/builder',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_CV_BUILDER_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_CV_BUILDER_MESSAGE || 'We are currently performing maintenance on the CV Builder.',
        estimatedTime: process.env.NEXT_PUBLIC_CV_BUILDER_TIME || '30 minutes'
      },
      {
        id: 'ats-check',
        name: 'ATS Check',
        path: '/ats-check',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_ATS_CHECK_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_ATS_CHECK_MESSAGE || 'ATS Check is undergoing scheduled maintenance.',
        estimatedTime: process.env.NEXT_PUBLIC_ATS_CHECK_TIME || '45 minutes'
      },
      {
        id: 'cover-letter',
        name: 'Cover Letters',
        path: '/cover-letter',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_COVER_LETTER_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_COVER_LETTER_MESSAGE || 'The Cover Letter Generator is temporarily unavailable.',
        estimatedTime: process.env.NEXT_PUBLIC_COVER_LETTER_TIME || '1 hour'
      },
      {
        id: 'templates',
        name: 'Templates',
        path: '/templates',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_TEMPLATES_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_TEMPLATES_MESSAGE || 'Template gallery is being updated.',
        estimatedTime: process.env.NEXT_PUBLIC_TEMPLATES_TIME || '15 minutes'
      },
      {
        id: 'examples',
        name: 'Examples',
        path: '/examples',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_EXAMPLES_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_EXAMPLES_MESSAGE || 'CV Examples section is being updated.',
        estimatedTime: process.env.NEXT_PUBLIC_EXAMPLES_TIME || '30 minutes'
      },
      {
        id: 'career-guide',
        name: 'Career Guide',
        path: '/guides',
        isInMaintenance: isEnabled(process.env.NEXT_PUBLIC_CAREER_GUIDE_MAINTENANCE),
        message: process.env.NEXT_PUBLIC_CAREER_GUIDE_MESSAGE || 'Career Guide is temporarily offline for improvements.',
        estimatedTime: process.env.NEXT_PUBLIC_CAREER_GUIDE_TIME || '1 hour'
      }
    ]
  }
}

// Check if a specific path is in maintenance
export function isPathInMaintenance(pathname: string): MaintenanceSection | null {
  const config = getMaintenanceConfig()
  
  if (config.globalMaintenance) {
    return {
      id: 'global',
      name: 'Site',
      path: '/',
      isInMaintenance: true,
      message: 'The entire site is currently undergoing maintenance.',
      estimatedTime: '1 hour'
    }
  }
  
  return config.sections.find(section => 
    pathname.startsWith(section.path) && section.isInMaintenance
  ) || null
}
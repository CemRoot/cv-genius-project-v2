import * as React from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean
  showClearButton?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  mobileKeyboard?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal'
  focusRing?: boolean
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    showPasswordToggle = false,
    showClearButton = false,
    inputMode,
    mobileKeyboard,
    focusRing = true,
    error = false,
    success = false,
    ...rest 
  }, ref) => {
    // Extract onChange so we can call it in clear handler, but keep it inside rest too
    const { onChange } = rest as { onChange?: React.ChangeEventHandler<HTMLInputElement> }
    // Note: DO NOT remove `value` from rest – keeps the component uncontrolled unless a value prop is explicitly provided (e.g., by react-hook-form)
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    // Handle clear button
    const handleClear = React.useCallback(() => {
      if (onChange) {
        const event = {
          target: { value: '' },
          currentTarget: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      inputRef.current?.focus()
    }, [onChange])

    // Debug wrapper for onChange – TEMP
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      console.log('🖋️ Input change', e.target.name, e.target.value)
      if (onChange) onChange(e)
    }

    // Map mobileKeyboard to inputMode
    const getInputMode = () => {
      if (inputMode) return inputMode
      if (mobileKeyboard) {
        const modeMap = {
          'numeric': 'numeric',
          'tel': 'tel',
          'email': 'email',
          'url': 'url',
          'search': 'search',
          'decimal': 'decimal',
          'text': 'text'
        }
        return modeMap[mobileKeyboard] as React.HTMLAttributes<HTMLInputElement>['inputMode']
      }
      return undefined
    }

    // Handle mobile keyboard types
    const getInputType = () => {
      if (type === 'password' && showPassword) return 'text'
      if (type) return type
      if (mobileKeyboard === 'email') return 'email'
      if (mobileKeyboard === 'tel') return 'tel'
      if (mobileKeyboard === 'url') return 'url'
      if (mobileKeyboard === 'search') return 'search'
      return 'text'
    }

    const isPasswordField = type === 'password'
    const hasValue = rest.value !== undefined ? String(rest.value).length > 0 : false

    return (
      <div className="relative group">
        <input
          ref={inputRef}
          type={getInputType()}
          inputMode={getInputMode()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          className={cn(
            "flex min-h-[48px] w-full rounded-md border bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-all duration-200",
            // Border colors
            error && "border-red-500 focus:border-red-500",
            success && "border-green-500 focus:border-green-500",
            !error && !success && "border-input",
            // Focus styles
            focusRing && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            focusRing && error && "focus-visible:ring-red-500",
            focusRing && success && "focus-visible:ring-green-500",
            focusRing && !error && !success && "focus-visible:ring-ring",
            // Padding adjustments for buttons
            (isPasswordField && showPasswordToggle) || (hasValue && showClearButton) ? "pr-10" : "",
            (isPasswordField && showPasswordToggle) && (hasValue && showClearButton) ? "pr-20" : "",
            // Mobile optimizations
            "text-[16px] md:text-sm", // Prevents zoom on iOS
            className
          )}
          suppressHydrationWarning={true}
          {...rest}
        />
        
        {/* Action buttons container */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {/* Clear button */}
          {showClearButton && hasValue && !rest.disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-400",
                "touch-manipulation"
              )}
              tabIndex={-1}
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Password toggle */}
          {isPasswordField && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-400",
                "touch-manipulation"
              )}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Focus indicator for mobile */}
        {isFocused && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary animate-pulse md:hidden" />
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
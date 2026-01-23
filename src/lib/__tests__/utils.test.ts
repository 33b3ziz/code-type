import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility function', () => {
  describe('basic class merging', () => {
    it('should merge multiple class strings', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle single class', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('should return empty string for no inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('conditional classes', () => {
    it('should handle boolean conditionals', () => {
      const result = cn('always', true && 'included', false && 'excluded')
      expect(result).toBe('always included')
    })

    it('should handle undefined values', () => {
      const result = cn('class1', undefined, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle null values', () => {
      const result = cn('class1', null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle false values', () => {
      const result = cn('class1', false, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle 0 as falsy', () => {
      const result = cn('class1', 0, 'class2')
      expect(result).toBe('class1 class2')
    })
  })

  describe('object syntax', () => {
    it('should handle object with true values', () => {
      const result = cn({ included: true, excluded: false })
      expect(result).toBe('included')
    })

    it('should handle mixed object and string', () => {
      const result = cn('base', { conditional: true, removed: false })
      expect(result).toBe('base conditional')
    })

    it('should handle empty object', () => {
      const result = cn('base', {})
      expect(result).toBe('base')
    })
  })

  describe('array syntax', () => {
    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle nested arrays', () => {
      const result = cn(['class1', ['class2', 'class3']])
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle arrays with conditionals', () => {
      const result = cn(['always', true && 'included', false && 'excluded'])
      expect(result).toBe('always included')
    })
  })

  describe('tailwind class merging (twMerge)', () => {
    it('should merge conflicting padding classes', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('should merge conflicting margin classes', () => {
      const result = cn('m-4', 'm-8')
      expect(result).toBe('m-8')
    })

    it('should merge conflicting text color classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should merge conflicting background color classes', () => {
      const result = cn('bg-white', 'bg-black')
      expect(result).toBe('bg-black')
    })

    it('should merge conflicting width classes', () => {
      const result = cn('w-full', 'w-1/2')
      expect(result).toBe('w-1/2')
    })

    it('should merge conflicting height classes', () => {
      const result = cn('h-screen', 'h-64')
      expect(result).toBe('h-64')
    })

    it('should keep non-conflicting classes', () => {
      const result = cn('p-4', 'm-2', 'text-red-500')
      expect(result).toBe('p-4 m-2 text-red-500')
    })

    it('should merge specific direction padding', () => {
      const result = cn('px-4', 'px-2', 'py-4')
      expect(result).toBe('px-2 py-4')
    })

    it('should handle responsive prefixes', () => {
      const result = cn('md:p-4', 'md:p-2')
      expect(result).toBe('md:p-2')
    })

    it('should handle hover states', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500')
      expect(result).toBe('hover:bg-red-500')
    })

    it('should merge flex direction classes', () => {
      const result = cn('flex-row', 'flex-col')
      expect(result).toBe('flex-col')
    })

    it('should merge justify classes', () => {
      const result = cn('justify-start', 'justify-center')
      expect(result).toBe('justify-center')
    })

    it('should merge align items classes', () => {
      const result = cn('items-start', 'items-center')
      expect(result).toBe('items-center')
    })

    it('should merge font size classes', () => {
      const result = cn('text-sm', 'text-lg')
      expect(result).toBe('text-lg')
    })

    it('should merge font weight classes', () => {
      const result = cn('font-normal', 'font-bold')
      expect(result).toBe('font-bold')
    })

    it('should merge rounded classes', () => {
      const result = cn('rounded', 'rounded-lg')
      expect(result).toBe('rounded-lg')
    })

    it('should merge shadow classes', () => {
      const result = cn('shadow', 'shadow-lg')
      expect(result).toBe('shadow-lg')
    })
  })

  describe('complex use cases', () => {
    it('should handle typical component styling pattern', () => {
      const baseStyles = 'flex items-center justify-center p-4'
      const conditionalStyles = { 'bg-blue-500': true, 'bg-gray-500': false }
      const overrideStyles = 'p-2'

      const result = cn(baseStyles, conditionalStyles, overrideStyles)
      expect(result).toBe('flex items-center justify-center bg-blue-500 p-2')
    })

    it('should handle variant patterns', () => {
      const variants = {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      }
      const variant: keyof typeof variants = 'destructive'
      const baseClass = 'rounded-md px-4 py-2'

      const result = cn(baseClass, variants[variant])
      expect(result).toBe('rounded-md px-4 py-2 bg-destructive text-destructive-foreground')
    })

    it('should handle size patterns', () => {
      const sizes = {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      }
      const size: keyof typeof sizes = 'lg'
      const baseClass = 'flex items-center h-10'

      const result = cn(baseClass, sizes[size])
      expect(result).toBe('flex items-center h-12 px-6 text-lg')
    })

    it('should handle disabled states', () => {
      const isDisabled = true
      const result = cn(
        'bg-blue-500 text-white',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )
      expect(result).toBe('bg-blue-500 text-white opacity-50 cursor-not-allowed')
    })

    it('should handle className prop override', () => {
      const defaultClasses = 'bg-blue-500 text-white p-4'
      const classNameProp = 'bg-red-500 m-2'

      const result = cn(defaultClasses, classNameProp)
      expect(result).toBe('text-white p-4 bg-red-500 m-2')
    })
  })

  describe('edge cases', () => {
    it('should handle extra whitespace in class strings', () => {
      const result = cn('  class1  ', '  class2  ')
      expect(result).toBe('class1 class2')
    })

    it('should handle multiple spaces between classes', () => {
      const result = cn('class1    class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle all falsy values', () => {
      const result = cn(null, undefined, false, '', 0)
      expect(result).toBe('')
    })

    it('should handle deeply nested structures', () => {
      const result = cn(['a', ['b', ['c', { d: true, e: false }]]])
      expect(result).toBe('a b c d')
    })
  })
})

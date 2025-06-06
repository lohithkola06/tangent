export const signinFormStyles = {
  container: {
    base: 'flex flex-col gap-4',
    error: 'border-red-500',
  },
  input: {
    base: 'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
    error: 'border-red-500 focus:ring-red-500',
  },
  label: {
    base: 'text-sm font-medium text-gray-700',
    error: 'text-red-500',
  },
  errorText: 'text-sm text-red-500',
  button: {
    base: 'w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600',
    loading: 'opacity-50',
  },
  link: 'text-blue-500 hover:text-blue-600',
} as const;

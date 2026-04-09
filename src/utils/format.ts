// Formatting utilities

export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    // Format VND without decimal places
    return (
      new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(amount)) + 'đ'
    )
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatDate = (date: Date | string, locale = 'vi-VN'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export const formatDateTime = (
  date: Date | string,
  locale = 'vi-VN'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

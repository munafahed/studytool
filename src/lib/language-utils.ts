export function detectLanguage(text: string): 'ar' | 'en' {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text) ? 'ar' : 'en';
}

export function detectPrimaryLanguage(data: Record<string, string>): 'ar' | 'en' {
  const allText = Object.values(data).join(' ');
  return detectLanguage(allText);
}

export function capitalizeText(text: string, language: 'ar' | 'en'): string {
  if (language === 'en') {
    return text
      .split(' ')
      .map(word => {
        if (word.length > 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join(' ');
  }
  return text;
}

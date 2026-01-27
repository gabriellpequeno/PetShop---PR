export class CookieConsumer {
  static setCookie(name: string, value: string, days: number = 1): void {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `; expires=${date.toUTCString()}`
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`
  }

  static getCookie(name: string): string | null {
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    for (let c of ca) {
      c = c.trim()
      if (c.startsWith(nameEQ)) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  }

  static removeCookie(name: string): void {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
  }
}
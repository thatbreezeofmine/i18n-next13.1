import { NextResponse } from "next/server"

export const defaultLocale = "en-US"
export const defaultLocales = ["en-US", "en-CA", "fr-FR", "fr-BE"]
export const locales = ["en-US", "en-CA", "fr-CA", "fr-FR", "fr-BE"]

export const getLocalePartsFrom = ({ pathname, locale }) => {
  if (locale) {
    const localeParts = locale.toLowerCase().split("-")
    return {
      country: localeParts[1],
      lang: localeParts[0]
    }
  } else {
    const pathnameParts = pathname.toLowerCase().split("/")

    return {
      country: pathnameParts[1],
      lang: pathnameParts[2]
    }
  }
}

//create a dictionary for each locale
export const dictionaries = {
  "en-US": () =>
    import("dictionaries/en-US.json").then(module => module.default),

  "en-CA": () =>
    import("dictionaries/en-CA.json").then(module => module.default),

  "fr-CA": () =>
    import("dictionaries/fr-CA.json").then(module => module.default),

  "fr-FR": () =>
    import("dictionaries/fr-FR.json").then(module => module.default),

  "fr-BE": () =>
    import("dictionaries/fr-BE.json").then(module => module.default)
}

export const getTranslator = async locale => {
  const dictionary = await dictionaries[locale]()
  return (key, params) => {
    let translation = key ? key
      .split(".")
      .reduce((obj, key) => obj && obj[key], dictionary) : null
    if (!translation) {
      return key
    }
    if (params && Object.entries(params).length) {
      Object.entries(params).forEach(([key, value]) => {
        translation = translation.replace(`{{ ${key} }}`, String(value))
      })
    }
    return translation
  }
}

const getCountryFromLocale = (locale) => {
  const country = locale.split("-")[1];
  return country ? [country.toUpperCase()] : [];
};

const getLanguageFromLocale = (locale) => {
  const country = locale.split("-")[0];
  return country ? [country.toUpperCase()] : [];
};

const findBestMatchingLocale = (acceptLangHeader, currentPathnameParts) => {
  // parse the locales acceptable in the header, and sort them by priority (q)

    const matchedLocale = false
    if (matchedLocale) {
      return matchedLocale
    }
    // if we didn't find a match for both language and country, try just the country
    else {
      const matchedCountry = defaultLocales.find(locale => {
        const localeParts = getLocalePartsFrom({ locale })
        return currentPathnameParts.country === localeParts.country
      })
      if (matchedCountry) {
        return matchedCountry
      } else {
        // if we didn't find a match for both language and country, try just the language
        const matchedLanguage = locales.find(locale => {
          const localeParts = getLocalePartsFrom({ locale })

          return currentPathnameParts.lang === localeParts.lang
        })

        if (matchedLanguage && !matchedLanguage.includes("US")) {
          return matchedLanguage
        }
      }
    }

  // if we didn't find a match, return the default locale
  return defaultLocale
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname

  var defaultLocaleParts = getLocalePartsFrom({ locale: defaultLocale })
  const currentPathnameParts = getLocalePartsFrom({ pathname })

  // Check if the default locale is in the pathname
  if (
    currentPathnameParts.lang === defaultLocaleParts.lang &&
    currentPathnameParts.country === defaultLocaleParts.country
  ) {
    // we want to REMOVE the default locale from the pathname,
    // and later use a rewrite so that Next will still match
    // the correct code file as if there was a locale in the pathname
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          `/${defaultLocaleParts.country}/${defaultLocaleParts.lang}`,
          pathname.split("/").length > 3 ? "" : "/"
        ),
        request.url
      )
    )
  }

  var defaultLang = defaultLocales.filter(locale => {
    const mylocaleParts = getLocalePartsFrom({ locale })
    return currentPathnameParts.country === mylocaleParts.country
  })

  if (defaultLang.length > 0) {
    const matchedLocaleParts = getLocalePartsFrom({ locale: defaultLang[0] })
    if (matchedLocaleParts.lang === currentPathnameParts.lang) {
      return NextResponse.redirect(
        new URL(
          `/${matchedLocaleParts.country}${pathname.replace(
            "/" + matchedLocaleParts.country + "/" + matchedLocaleParts.lang,
            ""
          )}`,
          request.url
        )
      )
    }
  }

  const pathnameIsMissingValidLocale = locales.every(locale => {
    const localeParts = getLocalePartsFrom({ locale })

    return !pathname.startsWith(`/${localeParts.country}/${localeParts.lang}`)
  })

  if (pathnameIsMissingValidLocale) {
    // rewrite it so next.js will render `/` as if it was `/us/en`
    const matchedLocale = findBestMatchingLocale(
      request.headers.get("Accept-Language") || defaultLocale,
      currentPathnameParts
    )

    const localeParts = getLocalePartsFrom({ locale: matchedLocale })
    if (pathname.startsWith(`/${localeParts.country}`)) {
      var defaultLang = defaultLocales.filter(locale => {
        const mylocaleParts = getLocalePartsFrom({ locale })
        return localeParts.country === mylocaleParts.country
      })

      if (defaultLang.length > 0) {
        const matchedLocaleParts = getLocalePartsFrom({
          locale: defaultLang[0]
        })
        return NextResponse.rewrite(
          new URL(
            `/${matchedLocaleParts.country}/${
              matchedLocaleParts.lang
            }${pathname.replace("/" + matchedLocaleParts.country, "")}`,
            request.url
          )
        )
      }
    }

    if (matchedLocale !== defaultLocale) {
      const matchedLocaleParts = getLocalePartsFrom({ locale: matchedLocale })

      var defaultLang = defaultLocales.filter(locale => {
        const mylocaleParts = getLocalePartsFrom({ locale })
        return matchedLocaleParts.country === mylocaleParts.country
      })

      const localeParts = getLocalePartsFrom({ locale: defaultLang[0] })
      // console.log(localeParts.lang, matchedLocaleParts.lang)
      if (localeParts.lang == matchedLocaleParts.lang) {
        return NextResponse.redirect(
          new URL(`/${matchedLocaleParts.country}${pathname}`, request.url)
        )
      }

      return NextResponse.redirect(
        new URL(
          `/${matchedLocaleParts.country}/${matchedLocaleParts.lang}${pathname}`,
          request.url
        )
      )
    } else {
      return NextResponse.redirect(
        new URL(
          `/${defaultLocaleParts.country}${pathname}`,
          request.url
        )
      )
    }
  }
}


export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"
  ]
}

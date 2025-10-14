
export const randomSpecialChar = (): string => {
  const specialCharacters = '@$!%()*#?&^<>'
  const index = Math.floor((specialCharacters.length - 1) * Math.random())

  return specialCharacters.substring(index, index + 1)
}

export const createSlugSearch = (str: string, forSearch = false): string => {
  str = str.toLowerCase()

  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
  str = str.replace(/Đ/g, 'D')

  if (!forSearch) {
    str = str.replace(/([^0-9a-z-\s])/g, '')
  }

  str = str.replace(/(\s+)/g, '-')

  str = str.replace(/^-+/g, '')

  str = str.replace(/-+$/g, '')

  return str
}

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * Method to convert a word with singular form to plural form (pluralize)
 * - If the singular word is Claf, Half, Knife, Leaf, Life, Loaf, Self, Thief, Wife, Wolf - just remove f/fe and put 'ves' at end of the word
 * - If that word end with 'O,S,X,Z,CH,SH' - put 'es' at end of the word
 * - If that word end with 'consonant + Y' like Fly, Sky, Baby, ... - remove 'y' and input 'ies' at end of the word
 * - For the remaining - put 's' at end of the word
 */

export const pluralize = (singularForm: string) => {
  let pluralizeForm = ''
  const specialWord = ['claf', 'half', 'knife', 'leaf', 'life', 'loaf', 'self', 'thief', 'wife', 'wolf']

  if (!singularForm) {
    return null
  }

  //If the singular form is already plurialized, do nothing
  if (
    singularForm.endsWith('ies') ||
    singularForm.endsWith('es') ||
    (!singularForm.endsWith('us') && !singularForm.endsWith('ss') && singularForm.endsWith('s'))
  ) {
    return singularForm
  }

  if (specialWord.includes(singularForm.toLowerCase())) {
    if (singularForm.endsWith('f')) {
      pluralizeForm = singularForm.substring(0, singularForm.length - 1) + 'ves'
    } else {
      pluralizeForm = singularForm.substring(0, singularForm.length - 2) + 'ves'
    }
  } else if (
    singularForm.endsWith('y') &&
    !singularForm.endsWith('uy') &&
    !singularForm.endsWith('ey') &&
    !singularForm.endsWith('oy') &&
    !singularForm.endsWith('ay')
  ) {
    pluralizeForm = singularForm.substring(0, singularForm.length - 1) + 'ies'
  } else if (
    singularForm.endsWith('o') ||
    singularForm.endsWith('s') ||
    singularForm.endsWith('x') ||
    singularForm.endsWith('z') ||
    singularForm.endsWith('ch') ||
    singularForm.endsWith('sh')
  ) {
    pluralizeForm = singularForm + 'es'
  } else {
    pluralizeForm = singularForm + 's'
  }

  return pluralizeForm
}

export const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}
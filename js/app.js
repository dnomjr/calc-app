'use strict'

import 'core-js/actual'
import themes from './config.js'
import { evaluate } from 'mathjs'

const btnToggle = document.querySelector('.header__theme button')
const deleteBtns = document.querySelectorAll('.control')
const numbers = document.querySelectorAll('#number')
const operators = document.querySelectorAll('.operator')
const form = document.querySelector('.calculator form')
const calc = document.querySelector('.calculator__display p:first-child')
const root = document.documentElement

let themeNum = 0
let actualNumber = ''
let result = ''

/*** TOGGLE THEME & SET STORAGE ***/
const setStorage = function (num) {
  localStorage.setItem('theme', JSON.stringify(num))
}

const setCustomVariable = function (num) {
  const theme = themes[num]
  Object.keys(theme).forEach(function (variableName) {
    root.style.setProperty(variableName, theme[variableName])
  })
}

const setTheme = function () {
  themeNum = (themeNum + 1) % themes.length
  btnToggle.style.transform = `translateX(${themeNum * 125}%)`
  setCustomVariable(themeNum)
  setStorage(themeNum)
}

const getStorage = function () {
  const theme = JSON.parse(localStorage.getItem('theme'))
  document.body.classList.add('load')
  if (!theme) return
  themeNum = theme - 1
  setTheme()
}

/*** MAIN FUNCTIONALITY ***/
const setScroll = function () {
  calc.scrollLeft = calc.scrollWidth
}
const validateNumber = function (value) {
  let dot = value === '.'
  let minus = value === '-'

  return (
    (dot && ['-', '+', '/', 'x'].includes(calc.textContent.at(-1))) ||
    (dot && actualNumber.includes('.')) ||
    (dot && actualNumber.startsWith('-') && actualNumber.length === 1) ||
    (minus && actualNumber.startsWith('-')) ||
    (minus && actualNumber !== '') ||
    (minus && ['-', '+', '/', 'x'].includes(calc.textContent.at(-1))) ||
    (value === '0' && actualNumber.startsWith('0') && actualNumber.length < 2)
  )
}
const validateDot = function (value) {
  const dot = value === '.'

  return (
    (dot && actualNumber === '') ||
    (dot && result) ||
    (dot && calc.textContent === '0')
  )
}
const setNumber = function (e) {
  const value = e.target.value

  if (Number.isNaN(+result)) {
    calc.style.fontSize = 'clamp(36px, 16px + 1.9vw, 44px)'
  }
  if (validateNumber(value)) return
  if (validateDot(value)) {
    actualNumber = '0' + value
    calc.textContent = actualNumber
    result = ''
    return
  }

  if (result) calc.textContent = actualNumber = result = ''

  actualNumber += value
  calc.textContent = calc.textContent === '0' ? value : calc.textContent + value
  setScroll()
}
const setOperator = function (e) {
  const value = e.target.value

  if (actualNumber.at(-1) === '.') return
  if (calc.textContent.length === 1 && calc.textContent.startsWith('-')) return
  if (value === '-' && calc.textContent.at(-1) === '+') return

  if (actualNumber) {
    calc.textContent += value
    actualNumber = ''
  }
  if (result) result = ''
  setScroll()
}

/*** DELETE CHAR & RESET CALC  ***/
const resetChars = function () {
  actualNumber = ''
  calc.textContent = '0'
}
const deleteChar = function () {
  calc.textContent = calc.textContent.slice(0, -1)
  let matches = calc.textContent.match(/(\d+)(?:[^\d]+(\d+)$|$)/)
  actualNumber = matches ? matches[2] || matches[1] : ''
}
const handleDeleteReset = function (e) {
  let value = e.target.value
  if (value === 'RESET') return resetChars()

  if (value === 'DEL') {
    if (calc.textContent.length === 1 && !result) return resetChars()
    if (result) result = ''

    return deleteChar()
  }
}

/*** MAKE CALC & ROUND RESULT ***/
const bigDecimalRound = function (decimal, split) {
  let indexE = decimal.indexOf('e')
  let decimalFixed = decimal.slice(0, indexE)

  decimalFixed =
    decimalFixed.length > 4 ? decimalFixed.slice(0, 5) : decimalFixed

  return `${split[0]}.${decimalFixed}${decimal.slice(indexE)}`
}
const decimalRound = function (res) {
  let splitDot = res.split('.')
  let decimalPart = splitDot[1]

  if (decimalPart.includes('e')) {
    return bigDecimalRound(decimalPart, splitDot)
  }
  if (decimalPart.length > 4) return Number(res).toFixed(5)
}
const formatResult = function (res) {
  if (res.includes('.')) {
    return decimalRound(res)
  }

  if (Number.isNaN(+res) || !isFinite(+res)) {
    calc.style.fontSize = 'clamp(16px, 16px + 0.85vw, 28px)'
    return 'Division by 0 is not allowed'
  }
  console.log(res)
  return res
}
const getResult = function (e) {
  e.preventDefault()
  let math = calc.textContent
  if (Number.isNaN(+math.at(-1))) return

  if (math.includes('x')) calc.textContent = math.replaceAll('x', '*')

  result = formatResult(evaluate(calc.textContent).toString())
  calc.textContent = result
}

numbers.forEach(function (numb) {
  numb.addEventListener('click', setNumber)
})
operators.forEach(function (op) {
  op.addEventListener('click', setOperator)
})
deleteBtns.forEach(function (del) {
  del.addEventListener('click', handleDeleteReset)
})

form.addEventListener('submit', getResult)
btnToggle.addEventListener('click', setTheme)
document.addEventListener('DOMContentLoaded', getStorage)

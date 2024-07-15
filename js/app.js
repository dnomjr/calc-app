'use strict'
if (module.hot) {
  module.hot.accept()
}

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
const deleteResetCalc = function (c) {
  c.addEventListener('click', function () {
    let lastChar = calc.textContent.slice(-1)

    if (c.value === 'RESET') {
      actualNumber = ''
      calc.textContent = '0'
    } else if (c.value === 'DEL') {
      if (calc.textContent.length === 1 && !result) {
        actualNumber = ''
        calc.textContent = '0'
        return
      }
      if ('-+/*x'.includes(lastChar)) {
        calc.textContent = calc.textContent.slice(0, -1)
        let matches = calc.textContent.match(/(\d+)(?:[^\d]+(\d+)$|$)/)
        actualNumber = matches[2] || matches[1]
        return
      }
      if (result) {
        actualNumber = calc.textContent.slice(0, -1)
        calc.textContent = actualNumber
        result = ''
        console.log(result, calc.textContent, actualNumber)
        return
      }

      actualNumber = actualNumber.slice(0, -1)
      calc.textContent = calc.textContent.slice(0, -1)
    }
  })
}
const formatResult = function (res) {
  if (res.includes('.')) {
    let decimalPart = res.split('.')[1]
    if (decimalPart.length > 4) return Number(res).toFixed(5)
  }

  if (Number.isNaN(+res) || !isFinite(+res)) {
    calc.style.fontSize = 'clamp(16px, 16px + 0.85vw, 28px)'
    return 'Division by 0 is not allowed'
  }
  return res
}
const getResult = function (e) {
  e.preventDefault()
  if (Number.isNaN(+calc.textContent.at(-1))) return

  result = formatResult(evaluate(calc.textContent).toString())
  calc.textContent = result
}

numbers.forEach(function (numb) {
  numb.addEventListener('click', setNumber)
})
operators.forEach(function (op) {
  op.addEventListener('click', setOperator)
})
deleteBtns.forEach(deleteResetCalc)

form.addEventListener('submit', getResult)
btnToggle.addEventListener('click', setTheme)
document.addEventListener('DOMContentLoaded', getStorage)

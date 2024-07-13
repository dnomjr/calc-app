'use strict'
/* if (module.hot) {
  module.hot.accept()
} */

import themes from './config.js'
import { evaluate } from 'mathjs'

const btnToggle = document.querySelector('.header__theme button')
const root = document.documentElement

/*** TOGGLE THEME & SET STORAGE ***/
let themeNumber = 0

const setStorage = function (num) {
  localStorage.setItem('theme', JSON.stringify(num))
}

const setBtnPosition = function (num) {
  btnToggle.style.transform = `translateX(${num * 125}%)`
  setStorage(num)
}

const setCustomVariable = function (themeNum) {
  const theme = themes[themeNum]
  Object.keys(theme).forEach(function (variableName) {
    root.style.setProperty(variableName, theme[variableName])
  })
  setBtnPosition(themeNum)
}

const toggleBtn = function () {
  themeNumber = (themeNumber + 1) % themes.length
  setCustomVariable(themeNumber)
}

const getStorage = function () {
  const theme = JSON.parse(localStorage.getItem('theme'))
  document.body.classList.add('load')
  if (!theme) return
  setCustomVariable(theme)
}

document.addEventListener('DOMContentLoaded', getStorage)
btnToggle.addEventListener('click', toggleBtn)

/*** MAIN FUNCTIONALITY ***/
let actualNumber = ''
let arrNumbers = []

const numbers = document.querySelectorAll('#number')
const operators = document.querySelectorAll('.operator')
const result = document.querySelector('.calculator form')
let calc = document.querySelector('.calculator__display p:first-child')

const checkNumber = function (value) {
  return (
    (value === '.' && actualNumber.includes('.')) ||
    (value === '.' &&
      actualNumber.startsWith('-') &&
      actualNumber.length === 1) ||
    (value === '-' && actualNumber.startsWith('-')) ||
    (value === '-' && actualNumber !== '') ||
    (value === '0' &&
      actualNumber.startsWith('0') &&
      actualNumber.length < 2) ||
    (value === '-' &&
      (calc.textContent.at(-1) === '-' || calc.textContent.at(-1) === '+')) ||
    (value === '-' &&
      (calc.textContent.at(-1) === '/' || calc.textContent.at(-1) === 'x'))
  )
}

const getNumber = function (e) {
  const value = e.target.value
  if (value === '.' && actualNumber === '') {
    actualNumber = '0' + value
    calc.textContent = '0' + value
    return
  }

  if (calc.textContent === '0') {
    actualNumber += value
    calc.textContent = value
    return
  }
  if (checkNumber(value)) return

  actualNumber += value
  calc.textContent += value
}
numbers.forEach(function (numb) {
  numb.addEventListener('click', getNumber)
})

const makeCalc = function (e) {
  const value = e.target.value

  if (actualNumber.at(-1) === '.') return
  if (calc.textContent.length === 1 && calc.textContent.startsWith('-')) return

  if (actualNumber) {
    calc.textContent += value
    actualNumber = ''
  }
  if (value === '-' && calc.textContent.at(-1) === '+') return
}
operators.forEach(function (c) {
  c.addEventListener('click', makeCalc)
})

result.addEventListener('submit', function (e) {
  e.preventDefault()
  if (Number.isNaN(+calc.textContent.at(-1))) return

  calc.textContent = evaluate(calc.textContent)
})

document.querySelectorAll('.control').forEach(function (c) {
  c.addEventListener('click', function () {
    let lastChar = calc.textContent.slice(-1)
    if (c.value === 'RESET') {
      actualNumber = ''
      calc.textContent = '0'
      console.clear()
    } else if (c.value === 'DEL') {
      if (calc.textContent.length === 1) {
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
      actualNumber = actualNumber.slice(0, -1)
      calc.textContent = calc.textContent.slice(0, -1)
      console.log(calc.textContent, actualNumber)
    }
  })
})

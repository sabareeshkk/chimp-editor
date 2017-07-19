import $ from 'jquery'
import {doSave, doRestore} from './util'
import modals from './modalStrings'

const actions = {
  bold: {
    icon: '<b>B</b>',
    title: 'Bold',
    result: () => exec('bold')
  },
  italic: {
    icon: '<i>I</i>',
    title: 'Italic',
    result: () => exec('italic')
  },
  underline: {
    icon: '<u>U</u>',
    title: 'Underline',
    result: () => exec('underline')
  },
  strikethrough: {
    icon: '<strike>S</strike>',
    title: 'Strike-through',
    result: () => exec('strikeThrough')
  },
  heading1: {
    icon: '<b>H<sub>1</sub></b>',
    title: 'Heading 1',
    result: () => exec('formatBlock', '<H1>')
  },
  heading2: {
    icon: '<b>H<sub>2</sub></b>',
    title: 'Heading 2',
    result: () => exec('formatBlock', '<H2>')
  },
  paragraph: {
    icon: '&#182;',
    title: 'Paragraph',
    result: () => {
      exec('formatBlock', '<P>')
      // removeDivs()
    }
  },
  quote: {
    icon: '&#8220; &#8221;',
    title: 'Quote',
    result: () => exec('formatBlock', '<BLOCKQUOTE>')
  },
  olist: {
    icon: '&#35;',
    title: 'Ordered List',
    result: () => exec('insertOrderedList')
  },
  ulist: {
    icon: '&#8226;',
    title: 'Unordered List',
    result: () => exec('insertUnorderedList')
  },
  code: {
    icon: '&lt;/&gt;',
    title: 'Code',
    result: () => exec('formatBlock', '<PRE>')
  },
  line: {
    icon: '&#8213;',
    title: 'Horizontal Line',
    result: () => exec('insertHorizontalRule')
  },
  link: {
    icon: '&#128279;',
    title: 'Link',
    result: () => {
      const url = window.prompt('Enter the link URL')
      if (url) exec('createLink', url)
    }
  },
  image: {
    icon: '&#128247;',
    title: 'Image',
    result: () => {
      InitializeModal(modals.modalString)
      // if (url) exec('insertImage', url)
    }
  },
  FontColor: {
    icon: ' &#9762;',
    title: 'Font Color',
    result: () => {
      exec('foreColor', '#2ecc71')
    }
  }
}

// aviary integration
const createAviary = () => {
  const featherEditor = new Aviary.Feather({
    apiKey: '1234567',
    onSave: (imageID, newURL) => {
      // console.log(imageID, newURL)
      const img = document.getElementById(imageID)
      img.src = newURL
    }
  })
  return featherEditor
}
const featherEditor = createAviary()
// end aviary

const InitializeModal = function (modalString) {
  const modal = document.createElement('figure')
  $(modal).attr('id', 'modalFigure')
  modal.innerHTML = modalString
  document.body.appendChild(modal)
  const myModal = document.getElementById('myModal')
  myModal.style.display = 'block'
  const span = document.getElementsByClassName('close')[0]
  span.onclick = function () {
    modal.style.display = 'none'
    $('#modalFigure').remove()
  }
  const modalSubmit = $('#imageButton')
  modalSubmit.click(() => {
    const modalVal = $('#imageUrl')
    const url = modalVal.val()
    if (url) {
      modal.style.display = 'none'
      $('#modalFigure').remove()
      doRestore()
      $('.pell-content').focus()
      exec('insertImage', url)
    }
  })
}

const classes = {
  actionbar: 'pell-actionbar',
  button: 'pell-button',
  content: 'pell-content'
}

export const exec = (command, value = null) => {
  document.execCommand(command, false, value)
  observeImages()
}

const observeImages = () => {
  $('.pell-content img').each((i, s) => {
    // console.log('sevent', i, s)
    $(s).off('click')
    $(s).click(event => {
      // console.log('helloo you clicked the img', this, event)
      const id = `img${i}`
      const src = $(s).attr('src')
      $(s).attr('id', id)
      launchImageEditor(id, src)
    })
  })
}

const launchImageEditor = function (id, src) {
  featherEditor.launch({
    image: id,
    url: src
  })
  return false
}

const preventTab = event => {
  doSave()
  if (event.which === 9) event.preventDefault()
  else if (event.which === 13) {
    // console.log('enter key');
    document.execCommand('insertHTML', false, '<br><br>')
    doSave()
    event.preventDefault()
  }
}

export const init = settings => {
  settings.actions = settings.actions
    ? settings.actions.map(action => {
      if (typeof action === 'string') return actions[action]
      else if (actions[action.name]) return { ...actions[action.name], ...action }
      return action
    })
    : Object.keys(actions).map(action => actions[action])

  settings.classes = { ...classes, ...settings.classes }

  const actionbar = document.createElement('div')
  actionbar.className = settings.classes.actionbar
  settings.element.appendChild(actionbar)

  createContentEditable(settings)

  createButtons(actionbar, settings.actions, settings)
  // console.log(featherEditor)
  if (settings.styleWithCSS) exec('styleWithCSS')

  return settings.element
}

const createContentEditable = settings => {
  settings.element.content = document.createElement('div')
  settings.element.content.contentEditable = true
  settings.element.content.id = 'editor'
  settings.element.content.className = settings.classes.content
  settings.element.content.oninput = event => settings.onChange(event.target.innerHTML)
  settings.element.content.onkeydown = preventTab
  settings.element.content.onmouseup = event => {
    doSave()
  }
  settings.element.appendChild(settings.element.content)
}

const createButtons = (actionbar, buttons, settings) => {
  buttons.forEach(action => {
    // console.log(action);
    let button = document.createElement('button')
    button.className = settings.classes.button
    button.innerHTML = action.icon
    button.title = action.title
    button.onclick = action.result
    if (action.title === 'Font Color') {
      console.log('font-clr')
      $(button).addClass('dropbtn')
      // const div = $('<div />')
      // const dropdown = $.parseHTML(modals.dropDown)
      // div.append(dropdown)
      // button = div
    }
    actionbar.appendChild(button)
  })
}

export default { exec, init }

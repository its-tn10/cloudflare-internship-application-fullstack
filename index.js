const COOKIE_NAME = 'saved_variant'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // fetch the list of variants
  const response = await (await fetch(`https://cfw-takehome.developers.workers.dev/api/variants`)).json()
  // select a random variant and display its HTML
  // use old variant if cookie is defined
  const cookie = getCookie(request, COOKIE_NAME)
  const variant = cookie ? cookie : Math.floor(Math.random() * response['variants'].length)
  const result = await new HTMLRewriter().on('*', new ElementHandler()).transform(await fetch(response['variants'][variant]))
  console.log(result)
  return new Response(await result.text(), {
    headers: { 'content-type': `text/html`, 'Set-Cookie': `${COOKIE_NAME}=${variant}; path=/` },
  })
}

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 * Obtained from https://developers.cloudflare.com/workers/templates/pages/cookie_extract/
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * ElementHandler class that will overwrite existing HTML content
 * Obtained from https://developers.cloudflare.com/workers/reference/apis/html-rewriter/#overview
 */
class ElementHandler {
  element(element) {
    if (element.tagName == 'title') {
      element.prepend(`Tien\'s Worker: `)
    } else if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
      element.prepend(`This is `)
    } else if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
      element.setInnerContent('There isn\'t much going on here. Let\'s jump somewhere else!')
    } else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
      element.setAttribute('href', 'https://tientavu.com')
      element.setInnerContent('Visit my website!')
    }
  }
}
const head = (enableMathjax: boolean, extra: JSX.Element | undefined) => (
  <head>
    <title>LameTeX</title>
    <meta charSet="UTF-8"></meta>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    <script src="https://unpkg.com/hyperscript.org@0.9.11"></script>
    <script src="https://unpkg.com/htmx.org/dist/ext/json-enc.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"></link>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script type="module" src="/static/cookies.js"></script>
    {enableMathjax && <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>}
    {enableMathjax && <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>}
    {extra}
    <style> {`
      pre { white-space: pre-wrap; word-wrap: break-word; }
      div { scrollbar-width: none;}
    `} </style>
  </head>
)

const bootstrapjs = () => (<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>)



export { head, bootstrapjs }
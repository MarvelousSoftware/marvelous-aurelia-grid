# Getting started
The `marvelous-aurelia-grid` is an open source, modern and powerful component based on [aurelia framework](http://aurelia.io/).

It provides rich set of features such as grouping, state persistance, filtering and many more. It leverages binding syntax
to make configuration as easy as possible. Default implementation of remote data source uses .NET's <code>IQueryable</code> interface
making integration with <code>ASP.NET</code> sites extremally simple. Under the hood it is built on component driven architecture
which makes it easy to extend. It provides local and remote data sources.

Project documentation: [http://marvelous.software/docs.html#/grid](http://marvelous.software/docs.html#/grid)

Please bear in mind that this library is still in the beta and some features (like translations support) might be missing.

## Installation
Install the grid into your project using jspm:
```
jspm install marvelous-aurelia-grid
```
Then load the css file and let know aurelia about the grid plugin:
```javascript
import 'marvelous-aurelia-grid/styles/default.css!';
// ...

export function configure(aurelia) {  
  let config = aurelia.use;

  config
    // ...
    .plugin('marvelous-aurelia-grid');

  aurelia.start().then(a => {
    a.setRoot();
  });
}
```

## Browser support
Currently only modern browsers are supported, but IE >= 9 support is on the TODO list.

## License
GNU General Public License is the only option for now, but commercial license will be available in the future.
It will not be free, but price will be really reasonable.

## Dependencies
* aurelia-binding
* aurelia-dependency-injection
* aurelia-templating
* marvelous-aurelia-core
* marvelous-aurelia-query-language

## Building The Code
This repository depends on other marvelous software repositories. In order to provide seamless development flow these libraries are watched automatically. The only prerequisite is following directories structure:

-- MarvelousSoftware

--- marvelous-aurelia-grid

--- marvelous-aurelia-core

--- marvelous-aurelia-query-language

Once the structure is correct `gulp watch` command will listen to dependend libraries changes.

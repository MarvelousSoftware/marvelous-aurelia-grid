# Getting started
The `marvelous-aurelia-grid` is an open source, modern and powerful component based on [aurelia framework](http://aurelia.io/).

It provides rich set of features such as grouping, state persistance, filtering and many more. It leverages binding syntax
to make configuration as easy as possible. Default implementation of remote data source uses .NET's <code>IQueryable</code> interface
making integration with <code>ASP.NET</code> sites extremally simple. Under the hood it is built on component driven architecture
which makes it easy to extend. It provides local and remote data sources.

Please bear in mind that this library is still in the beta and some features (like translations support) might be missing.

## Installation
To install the library just use jspm:
```
jspm install marvelous-aurelia-grid
```
Then it is required to load the css file and let know aurelia about the grid plugin:
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

## Options configuration
Each grid needs a configuration. Bare minimum is configured data source and columns.

There are 3 approaches to the configuration:

* HTML based
* Code based
* Mixed

The decision which one suits you best is up to you.

Here is an HTML based example:
```html
<m-grid>
  <data-source read.bind="data.getRandom(1000)"></data-source>
  <pagination size="10" all.bind="[5,10,20,40]"></pagination>
  <columns>
    <column heading="First Name" field="firstName"></column>
    <column heading="Last Name" field="lastName"></column>
  </columns>
</m-grid>
```

Exactly the same configuration with code based approach:
```javascript
import data from 'data';

export class SomePage {
  gridOptions;

  constructor() {
    this.gridOptions = {
      dataSource: { // camel case instead of dash case
        read: data.getRandom(1000)
      },      
      pagination: {
        size: 10,
        all: [5, 10, 20, 40]
      },
      columns: [
        { heading: 'First Name', field: 'firstName' },
        { heading: 'Last Name', field: 'lastName' }
      ]
    };
  }
}
```
```html
<m-grid options.bind="gridOptions">
</m-grid>
```

It is also allowed to mix both of them:
```javascript
import data from 'data';

export class SomePage {
  gridOptions;

  constructor() {
    this.gridOptions = {
      dataSource: {
        read: data.getRandom(1000)
      },      
      pagination: {
        size: 10,
        all: [5, 10, 20, 40]
      }
    };
  }
}
```
```html
<m-grid options.bind="gridOptions">
  <columns>
    <column heading="First Name" field="firstName"></column>
    <column heading="Last Name" field="lastName"></column>
  </columns>
</m-grid>
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

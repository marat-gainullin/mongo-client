# mongo-client
Platypus.js pluggable mongo client

## Using the mongo client in gradle project
Yo use this mongo client, you should add this dependency to your runtime dependencies:
```
runtime com.bearsoft.mongo:platypus-js-mongo-client:0.0.1
```
This will install jar artifacts of mongo client Pltypus.js API in dependencies of your project.
Also you need to use script artifacts. They are registered in `bower`and can be added to script
dependencies in two ways:
- Through [client dependencies gradle plugin](https://github.com/craigburke/client-dependencies-gradle/blob/master/README.adoc).
- Through bower package manager.

### Using gradle client dependencies plugin
First you need to include [client dependencies gradle plugin](https://github.com/craigburke/client-dependencies-gradle/blob/master/README.adoc) in build script of your project.
Add the following in your build script:
```
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.craigburke.gradle:client-dependencies:1.4.0'
    }
}

apply plugin: 'com.craigburke.client-dependencies'
```
Then you need to configure your bower dependency as follows:
```
clientDependencies {
    installDir= 'src/WEB-INF/classes'
    bower {
        'platypus-js-mongo-client'('0.0.7', from: 'src/main/js')
    }
}
war.dependsOn clientInstall
```
This will create mongo client `*.js` files in `src/WEB-INF/classes/platypus-js-mongo-client` folder

### Using bower package manager
First of all you need [bower](https://bower.io) package manager to be installed. Than you need to install [bower-installer](https://www.npmjs.com/package/bower-installer).
Than you need to create `bower.json` file in the root of your project and add the following there:
```
  "dependencies": {
    "platypus-js-mongo-client": "0.0.7"
  },
  "install": {
    "path": "src/WEB-INF/classes",
    "sources": {
      "platypus-js-mongo-client": "bower_components/platypus-js-mongo-client/src/main/js/*.js"
    }
  }
```
The `install` section is used by `bower-installer` to get rid of long pathnames and also to
comform [Platypus.js](https://github.com/marat-gainullin/platypus-js) convention about JavaScript libraries
location within of your project and JavaEE conventions about layout of web application projects.

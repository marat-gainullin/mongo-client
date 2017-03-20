# mongo-client
Platypus.js pluggable mongo client


## Using the mongo client
Yo use this mongo client, you should add this dependency to your runtime dependencies:
```
runtime com.bearsoft.mongo:platypus-js-mongo-client:0.0.1
```
This will install jar artifacts of mongo client Pltypus.js API artifact in dependencies of ypur project.
Also you need to use scripts artifacts wich can be included to script dependencies as follows:
```

```

## Notes

To use repositories like Bower with Gradle, you need this [gradle plugin](https://github.com/craigburke/client-dependencies-gradle/blob/master/README.adoc).
To use it you should ensure, that th efollowing is included in your build script:
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
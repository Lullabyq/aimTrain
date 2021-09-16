<h1 style="text-align:center;">Default gulp assembly</h1>

In order to use this template you should copy this assembly locally and run in console ( This command will download all nessessary files in your directory ) :
```
npm i
```

<br>
<br>


> ## Functionality

1) ### Liveserver
<br>

Create a local server that automatically updates content after you make any changes in your JS, HTML or SCSS files and save them.

Just run in console:
```
gulp
```

2) ### File management

|Tasks     |Compress          |Join together     |Additionally|
|------    |:----------------:|:----------------:|:----------:|
|SCSS      |:heavy_check_mark:|:heavy_check_mark:|<ul><li>convert to css</li><li>add `prefixes`</li></ul>|
|Images    |:heavy_check_mark:|:heavy_minus_sign:|:heavy_minus_sign:
|JavaScript|:heavy_check_mark:|:heavy_check_mark:|:heavy_minus_sign:
|HTML      |:heavy_check_mark:|:heavy_check_mark:|:heavy_minus_sign:


<br>
<br>


> ## Modern ES6 features
<br>


<span style="color:rgb(189, 129, 189);">Example 1 - Instead of this :</span>
```javascript
const gulp   = require('gulp')
const concat = require('gulp-concat')
```
- Uses :
```javascript
import gulp   from 'gulp'
import concat from 'gulp-concat'
```
<br>


<span style="color:rgb(189, 129, 189);">Example 2 - Instead of this :</span>
```javascript
gulp.task('scripts', function() {...})

exports.scripts = scripts
```
- Uses :
```javascript
export function scripts() {...}
```

- Or even more advanced :
```javascript
export const clear = () => del('dist/**')
```

<br>
<br>


> ## Commands
<br>

|Command      |   |Usage case|
|-------------|:-:|----------|
|`gulp`       | = |create a live server
|`gulp` build | = |create a public build
|`gulp` clear | = |clean *dist* directory
|`gulp` images| = |test img compress
# webpack-loader

    loader 是导出为一个函数的 node 模块。该函数在 loader 转换资源的时候调用。给定的函数将调用 loader API，并通过 this 上下文访问。

    loader的作用更倾向于处理代码，但是主要是用替换的方式操作，babel主要是根据AST树进行操作，当然也可以用代码替换的方式
    loader可以更方便的指定处理哪种类型的文件

### 简单用法

    当一个 loader 在资源中使用，这个 loader 只能传入一个参数 - 这个参数是一个包含包含资源文件内容的字符串

    同步 loader 可以简单的返回一个代表模块转化后的值。在更复杂的情况下，loader 也可以通过使用 this.callback(err, values...) 函数，返回任意数量的值。错误要么传递给这个 this.callback 函数，要么扔进同步 loader 中。

    loader 会返回一个或者两个值。第一个值的类型是 JavaScript 代码的字符串或者 buffer。第二个参数值是 SourceMap，它是个 JavaScript 对象。

### 复杂用法

    当链式调用多个 loader 的时候，请记住它们会以相反的顺序执行。取决于数组写法格式，从右向左或者从下向上执行。

    最后的 loader 最早调用，将会传入原始资源内容。
    第一个 loader 最后调用，期望值是传出 JavaScript 和 source map（可选）。
    中间的 loader 执行时，会传入前一个 loader 传出的结果。
    所以，在接下来的例子，foo-loader 被传入原始资源，bar-loader 将接收 foo-loader 的产出，返回最终转化后的模块和一个 source map（可选）

```sh
{
  test: /\.js/,
  use: [
    'bar-loader',
    'foo-loader'
  ]
}
```

### 用法准则

    简单易用。
    使用链式传递。
    模块化的输出。
    确保无状态。
    使用 loader utilities。
    记录 loader 的依赖。
    解析模块依赖关系。
    提取通用代码。
    避免绝对路径。
    使用 peer dependencies。

### 简单

    loaders 应该只做单一任务。这不仅使每个 loader 易维护，也可以在更多场景链式调用。

### 链式(Chaining)

    利用 loader 可以链式调用的优势。写五个简单的 loader 实现五项任务，而不是一个 loader 实现五项任务。功能隔离不仅使 loader 更简单，可能还可以将它们用于你原先没有想到的功能。

    以通过 loader 选项或者查询参数得到的数据渲染模板为例。可以把源代码编译为模板，执行并输出包含 HTML 代码的字符串写到一个 loader 中。但是根据用法准则，已经存在这样一个 apply-loader，可以将它和其他开源 loader 串联在一起调用。

    jade-loader：导出一个函数，把模板转换为模块。
    apply-loader：根据 loader 选项执行函数，返回原生 HTML。
    html-loader：接收 HTML，输出一个合法的 JS 模块。

    loader 可以被链式调用意味着不一定要输出 JavaScript。只要下一个 loader 可以处理这个输出，这个 loader 就可以返回任意类型的模块。

### 模块化(Modular)

    保证输出模块化。loader 生成的模块与普通模块遵循相同的设计原则。

### 无状态(Stateless)

    确保 loader 在不同模块转换之间不保存状态。每次运行都应该独立于其他编译模块以及相同模块之前的编译结果。

### loader 工具库(Loader Utilities)

    https://github.com/webpack/loader-utils
    充分利用 loader-utils 包。它提供了许多有用的工具，但最常用的一种工具是获取传递给 loader 的选项。schema-utils 包配合 loader-utils，用于保证 loader 选项，进行与 JSON Schema 结构一致的校验。这里有一个简单使用两者的例子：

```sh
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';

const schema = {
  type: 'object',
  properties: {
    test: {
      type: 'string'
    }
  }
}

export default function(source) {
  const options = getOptions(this);

  validateOptions(schema, options, 'Example Loader');

  // 对资源应用一些转换……

  return `export default ${ JSON.stringify(source) }`;
};
```

### loader 依赖(Loader Dependencies)

    如果一个 loader 使用外部资源（例如，从文件系统读取），必须声明它。这些信息用于使缓存 loaders 无效，以及在观察模式(watch mode)下重编译。下面是一个简单示例，说明如何使用 addDependency 方法实现上述声明：

```sh
import path from 'path';

export default function(source) {
  var callback = this.async();
  var headerPath = path.resolve('header.js');

  this.addDependency(headerPath);

  fs.readFile(headerPath, 'utf-8', function(err, header) {
    if(err) return callback(err);
    callback(null, header + "\n" + source);
  });
};
```

### 模块依赖(Module Dependencies)

    根据模块类型，可能会有不同的模式指定依赖关系。例如在 CSS 中，使用 @import 和 url(...) 语句来声明依赖。这些依赖关系应该由模块系统解析。

    可以通过以下两种方式中的一种来实现：

    通过把它们转化成 require 语句。
    使用 this.resolve 函数解析路径。
    css-loader 是第一种方式的一个例子。它将 @import 语句替换为 require 其他样式文件，将 url(...) 替换为 require 引用文件，从而实现将依赖关系转化为 require 声明。

    对于 less-loader，无法将每个 @import 转化为 require，因为所有 .less 的文件中的变量和混合跟踪必须一次编译。因此，less-loader 将 less 编译器进行了扩展，自定义路径解析逻辑。然后，利用第二种方式，通过 webpack 的 this.resolve 解析依赖。

    如果语言只支持相对 url（例如 url(file) 总是指向 ./file），通过使用 ~ 来指定已安装模块（例如，引用 node_modules 中的那些模块）。所以对于 url，相当于 url('~some-library/image.jpg')。

### 通用代码(Common Code)

    避免在 loader 处理的每个模块中生成通用代码。相反，你应该在 loader 中创建一个运行时文件，并生成 require 语句以引用该共享模块。

### 绝对路径(Absolute Paths)

    不要在模块代码中插入绝对路径，因为当项目根路径变化时，文件绝对路径也会变化。loader-utils 中的 stringifyRequest 方法，可以将绝对路径转化为相对路径。

### 同等依赖(Peer Dependencies)

    如果你的 loader 简单包裹另外一个包，你应该把这个包作为一个 peerDependency 引入。这种方式允许应用程序开发者在必要情况下，在 package.json 中指定所需的确定版本。

    例如，sass-loader 指定 node-sass 作为同等依赖，引用如下：

```sh
"peerDependencies": {
  "node-sass": "^4.0.0"
}
```

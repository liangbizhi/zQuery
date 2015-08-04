# zQuery

学习和模仿jQuery实现的小型库，实现并不是很好，仅供学习参考。有任何建议可以提交issue。(●'◡'●)

# jQuery源码结构

先看看以下代码，把握jQuery总体结构（源码版本2.0.3）。总的来说还是比较清晰的。

	(function( window, undefined ) {
		// 定义一些私有属性和方法
		...
		// 构造jQuery对象
		var jQuery = function( selector, context ) {
			return new jQuery.fn.init( selector, context, rootjQuery );
		},
		...
		jQuery.fn = jQuery.prototype = {
			constructor: jQuery,
			init: function( selector, context, rootjQuery ) {
				...
			},
			selector: "",
			length: 0,
			...
		};
		// 把jQuery的prototype赋给init函数的prototype
		// 因为初始化的时候是new jQuery.fn.init的
		// 也是为了jQuery后面的初始化 
		jQuery.fn.init.prototype = jQuery.fn;

		// 定义了extend方法，用于克隆对象（浅拷贝、深拷贝）
		jQuery.extend = jQuery.fn.extend = function() {
			...
		};
		// 定义了一堆静态属性和方法
		jQuery.extend({ ... });
		// 定义了一堆实例属性和方法
		jQuery.fn.extend({ ... });

		// 向外暴露接口
		if ( typeof window === "object" && typeof window.document === "object" ) {
			window.jQuery = window.$ = jQuery;
		}
	})( window );

## 匿名自执行函数

jQuery采用匿名自执行函数包裹，有效地防止命名空间的污染。

### window参数和undefined参数

`window`作为参数传入，这样`window`就可以作为局部变量使用。在jQuery内部使用`window`对象，就减少了在作用域链上查找`window`对象的时间。

`undefined`也是同样的道理，其实这个`undefined`并不是JavaScript数据类型的`undefined`，而是一个普普通通的变量名。只是因为没给它传递值，它的值就是`undefined`，`undefined`并不是JavaScript的保留字。

## 构造jQuery对象

jQuery对象并不是`new jQuery`创建的，而是通过`jQuery.fn.init`创建的。

### jQuery.fn.init

`jQuery.fn.init`是jQuery的构造函数。这也是为什么`init`方法后面会有如下代码的原因：

	jQuery.fn.init.prototype = jQuery.fn;

## jQuery.extend和jQuery.fn.extend

`extend`方法可以理解为克隆对象的方法。它为jQuery扩展提供了方法。其实它们实现的代码是一样的，之所以会有`jQuery.extend`和`jQuery.fn.extend`是因为这两个方法运行时的`this`指向不同，前者指向jQuery对象，这样可为jQuery扩展一些静态属性和方法；后者指向jQuery原型对象，可以为jQuery扩展一些原型属性和方法。

## jQuery的类数组对象结构

jQuery内部采用了一种叫“类数组对象”的方式作为存储结构，所以我们既可以像对象一样处理jQuery操作，也能像数组一样使用push、pop、shift、unshift、sort、each、map等类数组的方法操作jQuery对象。

# 自己实现的zQuery

* 参考了jQuery的总体设计架构。

* 支持链式调用。

* Ajax简单应用promise异步编程。

## 核心

* `zQuery(expr)`：接收一个包含 CSS 选择器的字符串，然后用这个字符串去匹配一组元素。目前只支持ID选择器。
* `get(index)`：取得其中一个匹配的元素。
* 同时你可以通过下标把zQuery对象转换为DOM对象。就像jQuery一样。
* `size()`：jQuery 对象中元素的个数。

## 属性

### 属性

* `attr(name)`：取得第一个匹配元素的属性值。如果没有该属性值则返回`undefined`。
* `attr(key, value)`：为所有匹配元素设置一个属性值。
* `attr(properties)`：为所有匹配元素元素设置多个属性值。
* `removeAttr(name)`：从每一个匹配的元素中删除一个属性。

### CSS类

* `hasClass(class)`：检查当前的元素是否含有某个特定的类。
* `addClass(class)`：为每个匹配的元素添加指定的类名。如果重复添加相同类名会自动去重。
* `removeClass([class])`：从所有匹配的元素中删除全部或者指定的类。

### HTML代码

* `html([val])`:取得（或设置）第一个匹配元素的html内容。
* `val([val])`：取得（或设置）具有value值的元素的value值，例如input标签。

## CSS

### CSS

* `css(name)`：访问第一个匹配元素的样式属性。

* `css(name, value)`：在所有匹配的元素中，设置一个样式属性的值。

* `css(properties)`：把一个“名/值对”对象设置为所有匹配元素的样式属性。

### 位置

* `offset()`：获取匹配元素在当前视口的相对偏移。
* `position()`：获取匹配元素相对父元素的偏移。


### 尺寸

* `height([val])`：todo
* `width([val])`：todo

## 选择器

### 基本

* `#id`：根据给定的ID匹配一个元素。
* `tagName`：根据给定的元素名匹配所有元素。
* `tagName.class`：匹配具有给定的类和给定的元素名的所有元素。
* `.class`：根据给定的类匹配元素。
* `*`：匹配所有元素。

### 层级

* `ancestor descendant`：在给定的祖先元素下匹配所有的后代元素。

### 属性

* `[attribute]`：匹配包含给定属性的元素。
* `[attribute=value]`：匹配给定的属性是某个特定值的元素。注意`value`不要包含`""`等字符串包裹符号。
* `tagName[attribute]`：匹配标签名为`tagName`且具有`attribute`属性的所有元素。
* `tagName[attribute=value]`：匹配标签名为`tagName`且属性`attribute`的值为`value`的所有元素。

以下是一些例子：

`$('#header p.class p[class=blue]')`

`$('p [href=#]')`

## 文档处理

* `parent()`：取得第一个匹配元素的最近父元素。

### 内部插入

* `append(content)`：向每个匹配的元素内部追加内容。
* `prepend(content)`：向每个匹配的元素内部前置内容。

### 外部插入

* `after(content)`：todo
* `before(content)`：todo

### 删除

* `remove([expr])`：从DOM中删除所有匹配的元素。

## 筛选

### 查找

* `find(expr)`：搜索所有与指定表达式匹配的元素。这个函数是找出正在处理的元素的后代元素的好方法。

## 事件

### 事件处理

* `bind(type, fn)`：为每个匹配元素的特定事件绑定事件处理函数。
* `unbind([type])`：取消绑定指定类型事件的所有事件处理函数。或者取消绑定所有事件处理函数。

### 事件代理

* `live(type, fn)`：TODO

### 事件

为所有的元素绑定相应的事件处理函数（暂不支持模拟事件触发）。

* `blur(fn) `：为所有选择元素绑定blur事件。
* `change(fn) `：为所有选择元素绑定change事件。
* `click(fn) `：为所有选择元素绑定click事件。
* `dblclick(fn) `：为所有选择元素绑定dblclick事件。
* `error(fn) `：为所有选择元素绑定error事件。
* `focus(fn) `：为所有选择元素绑定focus事件。
* `keydown(fn) `：为所有选择元素绑定keydown事件。
* `keypress(fn) `：为所有选择元素绑定keypress事件。
* `keyup(fn) `：为所有选择元素绑定keyup事件。
* `mousedown(fn) `：为所有选择元素绑定mousedown事件。
* `mousemove(fn) `：为所有选择元素绑定mousemove事件。
* `mouseout(fn) `：为所有选择元素绑定mouseout事件。
* `mouseover(fn) `：为所有选择元素绑定mouseover事件。
* `mouseup(fn) `：为所有选择元素绑定mouseup事件。
* `resize(fn) `：为所有选择元素绑定resize事件。
* `scroll(fn) `：：todo
* `select(fn) `：为所有选择元素绑定select事件。
* `submit(fn) `：为所有选择元素绑定submit事件。
* `unload(fn) `：为所有选择元素绑定unload事件。

## 效果

### 基本

* `show()`：显示隐藏的匹配元素。
* `hide()`：隐藏显示的元素。

## Ajax

* `$.ajax(options)`
	* `async`：boolean
	* `contentType`：String
	* `data`:Obejct或String
	* `error`：Function(XMLHttpRequest, textStatus)
	* `success`：Function(data, textStatus)
	* `type`：String，"get"[default] or "post"
	* `url`：String，默认当前页面

**同时Ajax方法支持promise。用法和jQuery一样。**


## 工具

### 测试操作

* `$.isArray(obj)`：测试对象是否为数组。
* `$.isFunction(obj)`：测试对象是否为函数。
* `$.isEmptyObject(obj)`：测试对象是否是空对象（不包含任何属性）。
* `$.isPlainObject(obj)`：测试对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。

### 数组和对象操作

* `each(object, [callback])`：通用例遍方法，可用于例遍对象和数组。回调函数拥有两个参数：第一个为对象的成员或数组的索引，第二个为对应变量或内容。如果需要退出`each`循环可使回调函数返回`false`其它返回值将被忽略。

### 字符串操作

* `$.trim(str)`：去掉字符串起始和结尾的空格。

### 插件编写

* `$.error(message)`：接受一个字符串，并且直接抛出一个包含这个字符串的异常。

# 缺点

1. 构造jQuery数组对象不完美。
2. 某些方法效率不是很好。
3. 大部分方法为门面方法。
4. 没有Deferred异步队列，数据缓存等（其实是看不明白(-__-)b）。
5. ...

# 参考

* jQuery 2.0.3源码
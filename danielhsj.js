/*定义一个全局对象*/
window.$ = {};


/*封装ajax函数*/
/*
* 1.为什么要封装一个ajax工具函数
* 1.1 提高开发效率
* 1.2 把一些不确定的情况考虑在其中
* */
/*
* 2.把不确定的内容
* 2.1 请求方式
* 2.2 请求地址
* 2.3 是否异步
* 2.4 发送参数  name=xgg&age=10 {name:xgg,age:18}
*
* 2.5 成功处理
* 2.6 失败处理
* */
/*
* 3.确定参数
* 3.1 type    请求方式    get           (get post)
* 3.2 url     请求地址    默认当前地址    字符串
* 3.3 async   是否异步    true          (true false)
* 3.4 data    发送数据    {}            js对象{name:xgg}
*
* 3.5 success 成功回调    function      函数  函数里面就是处理的成功业务
* 3.6 error   失败回调    function      函数  函数里面就是处理的失败业务
* */
$.ajax = function (options) {
    //option对象传参
    //如果对象不传或者传的不是对象停止执行该函数
    if (!options || typeof options != 'object') return false;
    //默认参数的处理
    var type = options.type == 'post' ? 'post' : 'get';
    var url = options.url || location.pathname;
    var async = options.async === false ? false : true;
    var data = options.data || {};
    //对象形式的数据，需要转换成键值对的数据字符窜，XHR对象需要
    var data2str = '';
    for (var key in data) {
        data2str += key + '=' + data[key] + '&';
    }
    //需要去掉最后一个&
    data2str = data2str && data2str.slice(0, -1);

    //请求发送之前
    if (options.beforeSend) {
        var flag = options.beforeSend();
        if (flag === false) {
            return false;
        }
    }

    //ajax编程
    //初始化对象
    var xhr = new XMLHttpRequest();
    //设置请求行
    xhr.open(type, type == 'get' ? (url + '?' + data2str) : url, async);
    //设置请求头
    if (type == 'post') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    //设置请求主体 发送
    xhr.send(type == 'get' ? null : data2str);

    xhr.onreadystatechange = function () {
        /* 通讯完成*/
        if (xhr.readyState == 4) {
            /* 成功的*/
            if (xhr.status == 200) {
                /*需要考虑问题 数据格式问题*/
                /*怎么确定后台返回的数据格式？*/
                /*后台有写接口的时候 规范  xml application/xml json application/json*/
                var result = null;
                var contentType = xhr.getResponseHeader('Content-Type');
                /*如果有xml 就是xml格式数据*/
                if (contentType.indexOf('xml') > -1) {
                    result = xhr.responseXML;
                }
                /*如果有json 就是json格式数据*/
                else if (contentType.indexOf('json') > -1) {
                    result = JSON.parse(xhr.responseText);
                }
                /*如果有标识  普通文本*/
                else {
                    result = xhr.responseText;
                }
                /*调用成功回调函数  把数据传递过去*/
                options.success && options.success(result);
            }
            /*失败的*/
            else {
                /*调用失败回调函数*/
                options.error && options.error({ status: xhr.status, statusText: xhr.statusText });
            }
        }
    };
    /*get请求*/
    $.get = function (options) {
        options.type = 'get';
        $.ajax(options);
    };
    /*post请求*/
    $.post = function (options) {
        options.type = 'post';
        $.ajax(options);
    };
}


//封装缓动函数
//需求 -- 当我的动画执行完毕之后，可以让下一个动画继续执行，获这可以做某些事情，比如：动画执行完毕，告诉别人可以继续操作
//思路：让动画完成之后，执行另一个函数 -- 在动画函数中添加回调函数 -- 将一个函数作为参数传递到另一个函数中被调用，这个作为参数的函数叫做回调函数
$.animate = function (element, obj, callback) {
    //清楚上一次的计时器
    clearInterval(element.timer);
    //为这次动画重新开始计时器
    element.timer = setInterval(function () {

        //因为如果没有假设，只要有一个属性到达目标，就会停下，其他的属性就都无法继续进行变换
        var flag = true;
        //循环的遍历对象，取出其中的键值对，进行动画修改
        for (var attr in obj) {
            //对每一个属性进行动画修改
            //当属性是opacity或者z-index等不是以px为单位的就不能像之前一样设置
            if (attr == "opacity") {
                // 1 获取当前值
                var current = parseFloat(getStyle(element, attr));
                var target = obj[attr];
                //2计算步长 -- 因为是小数运算，所以变大之后在取整比较
                current *= 100;
                target *= 100;
                var step = (target - current) / 10;
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                //重新设定
                current += step; //已经是放大100倍的数字,在重新设定的时候，要除回来
                element.style[attr] = current / 100;
                //判断停止
            } else if (attr == "zIndex") {
                //因为z-index是没有动画，可以直接设置为目标值就可以了
                element.style[attr] = obj[attr];
                var target = obj[attr];
                var current = target;

            } else {
                //这个部分即是以px为单位的属性的写法

                //1 获取当前值
                var current = parseFloat(getStyle(element, attr));
                //获取某个属性要到达的目标值
                var target = obj[attr];
                //2 计算步长
                var step = (target - current) / 10;
                //判断方向取整
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                //3 重新设定属性
                current += step;
                element.style[attr] = current + "px";
                //4 判断停止
            }
            if (target != current) {
                flag = false;
            }

        }
        //判断是否所有的属性都到达目标值，如果到达了，就停止计时器
        if (flag) {
            clearInterval(element.timer);
            //如果计时器停止了，证明动画都已经执行完毕了，调用回调函数，执行你想要动画结束后的逻辑
            callback && callback();
        }
    }, 20);
}

//事件工具函数封装
$.eventTool = {
    //获取事件对象兼容
    getEvent:function(event){
        return event || window.event;
    },
    //获取clientX兼容
    clientX:function(event){
        event = this.getEvent(event);
        return event.clientX;
    },
    //获取clientY兼容
    clientY:function (event){
        return this.getEvent(event).clientY;
    },
    //获取pageX兼容
    pageX: function(event){
        return this.getEvent(event).pageX || this.clientX(event) + (document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0);
    },
    //获取pageY兼容
    pageY:function(event){
        return this.getEvent(event).pageY || this.clientY(event) + (document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0);
    },
    //兼容的阻止事件冒泡
    stopPropagation:function(event){
        event = this.getEvent(event);
        if(event.stopPropagation){
            event.stopPropagation();
        }else {
            event.cancelBubble = true;
        }
    }
}
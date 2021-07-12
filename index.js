/**
 * 
 * @param {String} method 请求方式
 * @param {String} url    请求地址
 * @param {String} data   请求数据  key=value&key1=value1
 * @param {Function} cb     成功的回调函数
 * @param {Boolean} isAsync 是否异步 true
 */
function ajax(method, url, data, cb, isAsync) {
    // get   url + '?' + data
    // post 
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                cb(JSON.parse(xhr.responseText))
            }
        }
    }

    if (method == 'GET') {
        xhr.open(method, url + '?' + data, isAsync);
        xhr.send();
    } else if (method == 'POST') {
        xhr.open(method, url, isAsync);
        // key=value&key1=valu1
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(data);
    }


}
var tableData = [];
var nowPage = 1;
var pageSize = 10;
var allPage = 1;
// 用于书写当前系统中所有的事件绑定
function bindEvent() {
    var menu = document.querySelector('.menu');
    menu.onclick = function(e) {
        // 判断当前点击的是导航
        if (e.target.tagName === 'DD') {
            // 获取到当前导航对应的右侧显示内容的id
            var id = e.target.dataset.id;
            // 获取到右侧显示的内容去
            var content = document.getElementById(id);
            // 改变导航样式
            e.target.classList.add('active');
            var targetSiblings = getSiblings(e.target);
            for (var i = 0; i < targetSiblings.length; i++) {
                targetSiblings[i].classList.remove('active');
            }
            // 改变右侧内容区的内容
            content.style.display = 'block';
            var contentSiblings = getSiblings(content);
            for (var i = 0; i < contentSiblings.length; i++) {
                contentSiblings[i].style.display = 'none';
            }
        }
    }
    var addStudentgBtn = document.getElementById('add-student-btn');
    addStudentgBtn.onclick = function(e) {
            // console.log('====')
            e.preventDefault();
            var studentAddForm = document.getElementById('add-student-form');
            var result = getFormData(studentAddForm);
            console.log(result);
            if (result.status === 'success') {
                // var data = "";
                // for (var prop in result.data) {
                //     data += prop + '=' + result.data[prop] + '&';
                // }
                // data += "appkey=DuYimeiqi_1564986205860";
                // 将数据存储到后台
                // ajax('GET', 'http://open.duyiedu.com/api/student/addStudent', data, function (response) {
                //     console.log(response);
                //     if (response.status === 'success') {
                //         alert('添加成功');
                //         location.reload();
                //     } else {
                //         alert(response.msg);
                //     }
                // }, true);
                transferData('GET', '/api/student/addStudent', result.data, function() {
                    alert('添加成功');
                    location.reload();
                })
            } else {
                alert(result.msg);
            }

        }
        // 删除和编辑的功能
    var tBody = document.getElementById('tBody');
    var modal = document.querySelector('.modal');
    tBody.onclick = function(e) {
        if (e.target.classList.contains('edit')) {
            // 获取当前编辑按钮对应的学生在表格当中的索引值
            var pageIndex = getStudentIndex(e.target);
            //  第2页的  索引值为0 的同学
            //  1 * pageSize
            // 获取当前编辑的学生在所有数据当中的索引值
            var index = (nowPage - 1) * pageSize + pageIndex;
            modal.style.display = 'block';
            // 编辑表单数据回填
            renderEditForm(tableData[index]);
        } else if (e.target.classList.contains('remove')) {
            var pageIndex = getStudentIndex(e.target);
            var index = (nowPage - 1) * pageSize + pageIndex;
            var isDel = confirm('确认删除学号为' + tableData[index].sNo + '的学生信息？');
            if (isDel) {
                transferData('GET', '/api/student/delBySno', {
                    sNo: tableData[index].sNo
                }, function(res) {
                    alert('删除成功');
                    getTableData();
                })
            }
        }
    }
    modal.onclick = function(e) {
            // this.style.display = 'none';
            // 点击遮罩层要让弹框消失
            if (e.target === this) {
                this.style.display = 'none';
            }
        }
        // 编辑表单提交
    var editStudentBtn = document.getElementById('edit-student-btn');
    editStudentBtn.onclick = function(e) {
        e.preventDefault();
        var studentEditForm = document.getElementById('edit-student-form');
        var result = getFormData(studentEditForm);
        if (result.status === 'success') {
            // 提交处理
            transferData('GET', '/api/student/updateStudent', result.data, function() {
                alert('修改成功');
                modal.style.display = 'none'
                getTableData();
            })
        } else {
            alert(result.msg);
        }
    }
    var turnPage = document.querySelector('.turn-page');
    turnPage.onclick = function(e) {
        // 翻页
        if (e.target.classList.contains('prev-btn')) {
            nowPage--;
            var data = tableData.filter(function(item, index) {
                return index >= (nowPage - 1) * pageSize && index < nowPage * pageSize;
            })
            renderTable(data);
        } else if (e.target.classList.contains('next-btn')) {
            nowPage++;
            var data = tableData.filter(function(item, index) {
                return index >= (nowPage - 1) * pageSize && index < nowPage * pageSize;
            })
            renderTable(data);
        }
    }
}

// 获取node节点的所有兄弟节点 nextSibling
function getSiblings(node) {
    var parentNode = node.parentNode;
    var children = parentNode.children;
    var siblings = [];
    for (var i = 0; i < children.length; i++) {
        if (children[i] != node) {
            siblings.push(children[i]);
        }
    }
    return siblings;
}

bindEvent();


/**
 * 获取表单数据
 * @param {*} form
 * return  {data: {}, msg: "", status: 'success'} 
 */
function getFormData(form) {
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var sNo = form.sNo.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    var result = {
        data: {},
        msg: '',
        status: 'success'
    }
    if (!name || !email || !sNo || !birth || !phone || !address) {
        result.status = 'fail';
        result.msg = '信息填写不全，请校验后再提交';
        return result;
    }
    var emailReg = /^[\w.]+@[\w.]+\.(com|cn|net)$/
    if (!email.match(emailReg)) {
        result.status = 'fail';
        result.msg = '邮箱格式不正确';
        return result;
    }
    var sNoReg = /^\d{4,16}$/;
    if (!sNoReg.test(sNo)) {
        result.status = 'fail';
        result.msg = '学号必须为4-16位数字';
        return result;
    }
    // 1970 - 2020
    // var 
    if (birth <= 1970 || birth >= 2020) {
        result.status = 'fail';
        result.msg = '我们只招收1970年以后出生的人， 未满一岁不收';
        return result;
    }
    var phoneReg = /^1[3456789]\d{9}$/;
    if (!phoneReg.test(phone)) {
        result.status = 'fail';
        result.msg = '手机号有误';
        return result;
    }

    result.data = {
        name,
        sex,
        sNo,
        phone,
        email,
        birth,
        address
    }
    return result;

}

/**
 * 获取表格数据
 */
function getTableData() {
    // ajax('GET', 'http://open.duyiedu.com/api/student/findAll', "appkey=DuYimeiqi_1564986205860", function (response) {
    //     console.log(response);
    //     renderTable(response.data);
    // }, true);
    transferData('GET', '/api/student/findAll', "", function(response) {
        tableData = response.data;
        // 19条数据  每页5条   19 / 5 = 3.8   
        allPage = Math.ceil(tableData.length / pageSize);

        // 获取到第nowPage页的数据   数据条数 pageSize  
        /**
         * nowPage      index
         *   1          0 - (pageSize - 1) 
         *   2          (pageSize) --  (2 * pageSize - 1)
         *   3           2 * pageSize  -- (3 * pageSize - 1)
         *   ....               ......
         *   n          (n - 1) * pageSize  --- (n * pageSize - 1)
         */
        var data = tableData.filter(function(item, index) {
            return index >= (nowPage - 1) * pageSize && index < nowPage * pageSize;
        });
        renderTable(data);
    })
}

getTableData();
/**
 * 
 * @param {*} data
 * 渲染表格数据 
 */
function renderTable(data) {
    var tBody = document.getElementById('tBody');
    var str = "";
    data.forEach(function(item) {
        str += `<tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男': '女'}</td>
        <td>${item.email}</td>
        <td>${new Date().getFullYear() - item.birth}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="edit btn">编辑</button>
            <button class="remove btn">删除</button>
        </td>
    </tr>`
    });
    tBody.innerHTML = str;
    var prevBtn = document.querySelector('.prev-btn');
    var nextBtn = document.querySelector('.next-btn');
    if (nowPage > 1) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }

    if (nowPage < allPage) {
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }
}
/**
 * 封装本系统的所有调用ajax函数的部分
 * @param {*} method 
 * @param {*} path 
 * @param {*} data 
 * @param {*} cb 
 */
function transferData(method, path, data, cb) {
    var strData = "";
    // 如果传递过来的数据是对象类型的 需要将对象转换成key=value格式的字符串
    if (typeof data === 'object') {
        for (var prop in data) {
            strData += prop + '=' + data[prop] + '&';
        }
        strData = strData.slice(0, data.length - 1);
    } else {
        strData = data;
    }
    console.log(strData);
    strData += '&appkey=Q_A_Q_1590927055348'
    ajax(method, 'http://open.duyiedu.com' + path, strData, function(response) {
        // 如果后台返回的是所有行为都成功存储或者处理 那么继续执行回调函数 否则提示错误信息
        if (response.status === 'success') {
            cb(response)
        } else {
            alert(response.msg);
        }
    }, true);
}

// 获取当前学院的索引值
function getStudentIndex(node) {
    var trNode = node.parentNode;
    // 查找node标签的tr父节点
    while (trNode && trNode.tagName !== 'TR') {
        trNode = trNode.parentNode;
    }
    if (!trNode) {
        alert('没有找到当前按钮对应的tr父节点')
        return false;
    }
    var trNodeSiblings = trNode.parentNode.children;
    for (var i = 0; i < trNodeSiblings.length; i++) {
        if (trNodeSiblings[i] === trNode) {
            return i;
        }
    }
}


// 渲染编辑表单数据
/**
 * 
 * @param {*} data
 * 由于表单当中的数据在传递过来的学生信息里面都是存在的
 * 所以可以通过循环遍历学生信息判断学生的信息在表单当中是否含有填写的位置
 * 如果有的话则回填，如果没有的话，就不回填 
 */
function renderEditForm(data) {
    var form = document.getElementById('edit-student-form');
    // form.name.value = data.name;
    // form.sex.value = data.sex;
    for (var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}
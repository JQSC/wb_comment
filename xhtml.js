"use strict";
class xhtml {
    //将cookie对象转化为字符串格式
    static cookie_str(oCookie) {
        let str = "";
        for (let v in oCookie) {
            str += `${v}=${oCookie[v]}; `
        }
        return str
    }
    //获取所发表的每一条信息的时间和mid
    static getUserDetail(html) {
        const regexMid_Time = /<div class="WB_from S_txt2">[^]*?name=(\d+)[^]*?title="([^]*?)"[^]*?<\/div>/g;
        let result, loveInfo = [];
        while ((result = regexMid_Time.exec(html)) != null) {
            console.log(result[1], result[2])
            loveInfo.push({
                pubTime: result[2],
                mid: result[1],
                comments: 0
            })
        }
        xhtml.setComments(loveInfo, html);
        return loveInfo
    }
    static setComments(arr, html) {
        const regex_Comment = /W_ficon ficon_repeat S_ficon[^]*?<em>([^]*?)<\/em>/g
        let i = 0, result;
        while ((result = regex_Comment.exec(html)) != null) {
            //console.log(result[1])
            if (arr[i]) {
                arr[i].comments = (result[1] == "评论") ? 0 : result[1];
                i++
            }
        }
        return arr
    }
    static isCommentId(id, list) {
        if (list.length) { return false }
        let index = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i
            }
        }
        return index
    }
    //获取评论详情
    static getCommentDetail(html, commentList) {
        const regex_comment = /node-type="replywrap">[^]*?usercard="id=(\d+)"[^]*?>([^]*?)<\/a>/g
        let result;
        //4219921246273207
        while ((result = regex_comment.exec(html)) != null) {
            //判斷是否包含此id
            let userId = result[1], userName = result[2];
            //判断此用户是否已经评论过，如果评论过则返回在数组中的位置
            let isCommentToPosition = xhtml.isCommentId(userId, commentList)
            if (~isCommentToPosition) {
                commentList[isCommentToPosition].commentNum++
            } else {
                commentList.push(
                    {
                        id: userId,
                        name: userName,
                        commentNum: 1
                    }
                )
                console.log(`${userName}参与了评论!`)
            }
        }
        return commentList
    }
    //排序
    static commentSort(arr) {
        return arr.sort(function (a, b) {
            return b.commentNum - a.commentNum
        })
    }
}
module.exports = xhtml;



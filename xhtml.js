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
        if (list.length > 0) {
            return list.some(function (o, index, array) {
                if (o.id == id) {
                    o.commentNum++
                    return true
                }
            })
        }
    }
    static getCommentDetail(html, commentList) {
        const regex_comment = /node-type="replywrap">[^]*?usercard="id=(\d+)"[^]*?>([^]*?)<\/a>/g
        let result;
        //4219921246273207
        while ((result = regex_comment.exec(html)) != null) {
            //判斷是否包含此id
            let isConclude = xhtml.isCommentId(result[1], commentList)
            if (!isConclude) {
                console.log(`${result[2]}参与了评论!`)
                commentList.push(
                    {
                        id: result[1],
                        name: result[2],
                        commentNum: 1
                    }
                )
            }
            //console.log(result[1])
        }
        return commentList
    }
    static commentSort(arr) {
        return arr.sort(function (a, b) {
            return b.commentNum - a.commentNum
        })
    }
}
module.exports = xhtml;



//获取指定用户新浪微博信息和评论
const request = require('request');
const xhtml = require('./xhtml');
const fs = require('fs')
const cookie = require('./cookie');
let header = {
  "Accept-Language": "zh-CN,zh;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
}
//根据用户id查找指定的用户
let userId = "2524431250"
//如果cookie以字符串形式存储则不用cookie_str进行转化
header.Cookie = (typeof (header) == "string") ? cookie : xhtml.cookie_str(cookie);
//取每一页的所有数据,因为存在懒加载,所以需要将pagebar配置为0和1各取一遍
async function main(uid) {
  const url = "https://weibo.com/p/aj/v6/mblog/mbloglist?domain=100505&is_search=0&visible=0&is_ori=1&is_tag=0&profile_ftype=1&pl_name=Pl_Official_MyProfileFeed__20&feed_type=0&domain_op=100505"
  let sMaxPage = 0;
  let pagebar = 0; //0 或者1
  let pageDataList = [], listInfo = null, type = 1;
  while (type) {
    let wburl = url + `&id=100505${uid}&page=${sMaxPage}&pagebar=${pagebar}&pre_page=${sMaxPage}`;
    listInfo = await fetchContentHtml(wburl)  //[{pubTime,mid},]
    if (!listInfo || !listInfo.length) {
      type = 0;//结束循环
    } else {
      console.info(`正在解析第${sMaxPage + 1}页第${pagebar + 1}栏`)
      let l = pageDataList.length;
      //首页内容列表可能不足两栏，会存在重复情况
      if (l == 1 && pageDataList[l - 1][0].mid == listInfo[0].mid) {
        sMaxPage++
      } else {
        pageDataList.push(listInfo)
        sMaxPage = pagebar ? (++sMaxPage) : sMaxPage;
        pagebar = pagebar ? 0 : 1;
      }
    }
  }
  console.log("页面内容获取结束!")
  //所有页面获取结束,则开始取每一页中每一条微博的所有评论
  return getCommentAll(pageDataList)
}
//整合每一页的html
function fetchContentHtml(url) {
  //请求配置项
  let options = {
    method: 'GET',
    headers: header,
    url: url,
    gzip: true
  }
  return new Promise((resolve) => {
    request(options, function (err, res, body) {
      res.setEncoding('utf-8');
      let html = JSON.parse(body).data
      //fs.writeFile('./test.html',data, { flag: 'w', encoding: 'utf-8', mode: '0666' })
      resolve(xhtml.getUserDetail(html))
    })
  });
}


//获取评论--评论需要每一条的mid单独发请求
async function getCommentAll(pageDataList) {
  //请求配置项
  let options = {
    method: 'GET',
    headers: header,
    gzip: true
  }
  let commentUrl = "https://weibo.com/aj/v6/comment/small?ajwvr=6&act=list&isMain=true&dissDataFromFeed=%5Bobject%20Object%5D&location=page_100505_home&comment_type=0&_t=0"
  let commentList = [];
  for (let arr of pageDataList) {
    for (let o of arr) {
      //comments   mid  &mid=4219921246273207
      if (o.comments) {
        options.url = commentUrl + `&mid=${o.mid}`
        console.log(`开始取mid: ${o.mid} 的所有评论`)
        commentList = await fetchCommentHtml(options, commentList)
      }
    }
  }
  //取到所有评论进行排序
  xhtml.commentSort(commentList)
  for (let v of commentList) {
    console.log(`${v.name} 评论了 ${v.commentNum}次`)
  }
  return commentList;
}

function fetchCommentHtml(options, commentList) {
  return new Promise((resolve) => {
    request(options, function (err, res, body) {
      res.setEncoding('utf-8');
      let html = JSON.parse(body).data.html
      //fs.writeFile('./test2.html',data.html, { flag: 'w', encoding: 'utf-8', mode: '0666' })
      resolve(xhtml.getCommentDetail(html, commentList))
    })
  });
}

let argvs = process.argv;
let uid = argvs[2];
main(uid)




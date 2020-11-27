// 引入axios
import axios from 'axios'; // 引入axios
// 请求模拟数据
async function getDetails(data){
  const res = await axios('/details')
  if(res.status == 200) {
    return data = res
  }else{
    return '数据请求失败'
  }
}
async function getLists(){
  const res = await axios('/list')
  if(res.status == 200) {
    return res
  }else{
    return '数据请求失败'
  }
}
export default {
  getDetails,
  getLists
}
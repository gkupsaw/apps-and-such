// import axios from 'axios';

// const check = async () => {
//     await axios.get('http://localhost:8080/info').then(() => {
//         that.EC2 = 'http://localhost:8080';
//     }).catch(err => {
//         console.log('For localhost:', err);
//         that.EC2 = 'http://ec2-52-14-54-181.us-east-2.compute.amazonaws.com:8080'
//     });
// }

// console.log(EC2)

const EC2 = 'http://localhost:8080';
// const EC2 = 'http://ec2-52-14-54-181.us-east-2.compute.amazonaws.com:8080';

export default EC2;

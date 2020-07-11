const cluster=require('cluster');

// console.log(cluster.isMaster);

// Is the file being executed in master mode?
if(cluster.isMaster){
  //Cause index.js to be executed again but in child mode
cluster.fork();
cluster.fork();
cluster.fork();
cluster.fork();
}else{

  //Im a child I'm going to act like a server and do nopthing
const express = require('express');

const app =express();

function doWork(duration){
  const start= Date.now();
  while(Date.now()-start<duration){}
}

app.get('/', (req, res)=>{
  doWork(5000);
  res.send('Hellp, World!');
});

app.get('/fast', (req, res)=>{
  res.send('Hellp, Flash World!');
});
app.listen(3000);
}

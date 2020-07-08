# Node.js

## Table of Contents

| Sl.No|  Questions       |
|------|------------------|
| 01. |[Node.js Working](#nodejs-working)|
| 02. |[Event loop working](#event-loop-working)|
| 03. |[Flow chart of How does a node.js code works?](#flow-chart-of-how-does-a-nodejs-code-works)|
| 04. |[Thread Testing](#thread-testing)|
| 05. |[Operating system's Async Feature](#operating-systems-async-feature)|
| 06. |[Multitasking: Putting everything together](#multitasking-putting-everything-together)|

</br>


## Node.js Working

* **V8 dependency:**  open source JS engine created by google, to execute JS code outside of the browser. V8 translates js stuffs into c++.
* **Libuv Dependency:** C++ open source project gives node access to the OS underlying file system, netorking also handles some kind of concurrency, 
* **Purpose of NodeJS:** gives us interface to relate our JS side of our application to the actual c++ that’s running on our computer interpret and execute our JS code. It also provides a series of wrappers and a very unified inconsistent API for us to use inside our projects.
* **Lib** folder keeps all the Javascript implemntation.
* **Src** folder keeps c++ implementation of all the functions.
* **Process.binding()**  connects JS and C++ functions.
 </br>
 
 ## Event loop working
 
* **A Process** is an instance of computer programm that is being executed.
* Within a single process we can have multiple thread.
* **Thread has** some instructions that has to be run by cpu (one by one).
* If we have more than one core inside our cpus we can process multiple threas at a time.
* Whenever you start a node code it automatically creates a thread and then executes the code inside that one thread.
* **Event loop** is like a control structure, decides what a thread should be doing at a given point of time.
* Node event loop is **single threaded** however some of Node framework std lib function that we run outside of event loop are not single thread.

 *Below is the pseudo code to explain the working of Event loop inside node.js*
```javascript
// node myFile.js

const pendingTimers =[];
const pendingOSTasks =[]; // all the things that OS async feature is handling
const pendingOperations = []; // All the things threadpool is hanling

// New timers, tasks, operations are recorded from myFile running
myFile.runContents();

function shouldContinue(){
  // check one: ANy pending setTimeout, setInterval, setIntermediate?
  // check two: Any pending os tasks? (like server listening to port)
  // check three: Any pending long running operation? (like fs module)

  return pendingOSTasks.length || pendingOperations.length || pendingTimers.length
}

// entire body executes in  one 'tick'
while(shouldContinue()){ // event loop
  // 1.) Node looks at pendingTimers and sees if any fucntions are ready to be called.
  // looks at setInterval or setTimeout functions.
  // 2.) Node looks at pendingOSTasks and pendingOperations and calls relevent callbacks.

  // 3.) pause execution. Continue when some no of events occur (like a new pendingOSTasks or pendingOperations are done or a timer is about to complete)

  // 4.) Look at pendingTimers. Call any setIntermediate.

  // 5.) Handle any 'close' event.
}
// exit back to terminal
```
</br>


## Flow chart of How does a node.js code works?
*refer to further topics for better understanding*

<img src="https://github.com/ArpitSachan/Node.js/blob/master/Screenshot%20(299).png" width=400>

</br>


## Thread testing

  ```javascript
  const crypto = require('crypto');
	
	const start = Date.now();
	crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', ()=>{
	  console.log('1:', Date.now()- start);
	});
	
	crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', ()=>{
	  console.log('2:', Date.now()- start);
	});
  ```
	
	Output: 1: 1001, 2: 1012
	  this output should have been 1:1001, 2:2000(approximately) if node was actually single threaded.

* This happens because libuv c++ side decides to run some computational functions ouside the even loop. They use ThreadPool(series of four threads to run comuptational tasks.)
* So four threads handle offloading work of expensive calculations outside the event loop.
* But if you use 5 pbkdf2 function ouptut will be like 1: 1750 2:1778 3:1781 4:1784 **5:2661**
* We can write custom JS codes that uses the thread pool.
* All 'fs' module functions use the threadpool.
* If you see above figure 2 functions are being assigned to a single core that's why it is taking more time to complete task 1,2,3,4 than in two functions case as cpu core has to do twice as work. When all these four function get completed 5th function gets added to thread pool. Below image explains the same thing.
* We can change threadpool size using process.env.UV_THREADPOOL_SIZE = 2;
<img src="https://github.com/ArpitSachan/Node.js/blob/master/Screenshot%20(297).png" width=300>

</br>


## Operating system's Async Feature
* It makes all the requests in same time.
	```javascript
  const https = require('https');
	
	const start = Date.now();
	
	function doRequest(){
	https.request('https://www.google.com', res =>{
	  res.on('data', () =>{});
	  res.on('end', ()=>{
	    console.log(Date.now()-start);
	  })
	})
	.end();
	}
	
	doRequest();
	doRequest();
	doRequest();
	doRequest();
	doRequest();
	doRequest();
  ```
  ```
	OUTPUT : 334 341 342 348 376 382 (NOT USING THREADS).
  ```
 * Instead libUV delegates the request making to the underlying operating system, So it's actually our operating system that does the real HTTP request Libby is used to issue the request and then it just waits on the operating system to emit a signal that some response has come back to.
 * Everything around netorking uses underlying OS, os's async feature
 
 </br>
 
 
 ## Multitasking: Putting everything together
 *If we all the codes together as*
 
 ```javascript
 	const https = require('https');
	const crypto = require('crypto');
	const fs = require('fs');
	const start = Date.now();
	
	function doRequest(){
	https.request('https://www.google.com', res =>{
	  res.on('data', () =>{});
	  res.on('end', ()=>{
	    console.log(Date.now()-start);
	  })
	})
	.end();
	}
	
	function doHash(){
	crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', ()=>{
	  console.log('Hash:', Date.now()- start);
	});
	}
	doRequest();
	
	fs.readFile('multitasks.js', 'utf8', ()=>{
	  console.log('FS:', Date.now()-start);
	});
	
	doHash();
	doHash();
	doHash();
	doHash();
 ```
 ```
OUTPUT: 
340
HASH: 1583
FS: 1585
HASH:1596
HASH:1598
HASH:1609
 ```
 * If we remove all the hash functions from the above code the file reading from ahrd drive(fs.readfile) shows output FS:28(very fast) but if we add hash functions the what's happening here?
 * Everything inside FS module uses Thredpool. But still how does 5 thread(threadpool has 4 threads only) calls are showing same time, that's beacause when FS fuction goes to thread it make request to Hard rive for file access and then thread frees the FS function until the HD request gets completed and asign that thread to remained HASH function and when one of any hash function gets completed that spot gets asinged to FS function and as we know FS function complete quickly, So that's why **one HASH function got completed before FS**  but if we increase our threadpool size then FS will completed quickly. And if we use 1 then all the hash functions will complete beforeb fs.

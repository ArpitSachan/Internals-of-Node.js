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

window.addEventListener('load', function() {
    
    const progressBar = document.querySelector('#progress-bar')
    const progressText = document.querySelector('#progress-text')
    const progressPercentage = document.querySelector('#progress-percentage')
    const cancelButton = document.querySelector('#cancel-button')
    const storedTask = document.querySelector('#stored-task')
    const seeStoredTask = document.querySelector('#see-stored-task')
    const restartButton = document.querySelector('#restart-button')
    const apiUrl = 'https://jsonplaceholder.typicode.com/todos'
    let batchSize = 10
    const tasks = JSON.parse(localStorage.getItem('batch'));
    let completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
    let totalTasks = 0
    let isCancelled = false
    let isVisible = true

    console.log(tasks);
    if(tasks.length > 0){
        tasks.slice(-5).map((task)=>{
            let p = this.document.createElement("p")
            p.textContent = task.title
            storedTask.append(p)
        })
    }else{
        tasks = "Nothing to show"
    }

    seeStoredTask.onclick = ()=>{
        if(!isVisible){
            storedTask.style.opacity = 0
            isVisible =true
        }else{
            storedTask.style.opacity = 1
            isVisible =false
        }
    }


    async function importTasks() {
        restartButton.disabled = true
        restartButton.style.backgroundColor = '#ddd'
        restartButton.style.color = '#666'
        restartButton.style.cursor = 'not-allowed'; 
        try{
            const response = await fetch(apiUrl)
            if(!response.ok){
                throw new Error('Network response was not ok');
            }
            const tasks = await response.json()
            totalTasks = tasks.length

            for(let i = 0; i < totalTasks; i += batchSize){
                if (isCancelled){
                    updateStatus('Cancelled');
                    localStorage.setItem('completedTasks', completedTasks);
                    break;
                }

                const batch = tasks.slice(i, i + batchSize)
                localStorage.setItem("batch", JSON.stringify(batch))
                await processBatch(batch);
                completedTasks += batch.length
                updateProgress();
                localStorage.setItem('completedTasks', completedTasks);
            }

            // if it wasnt cancelled and the loop gets completed, meaning the batch finished processing 
            if(!isCancelled){
                updateStatus('Completed')
                localStorage.setItem('completed', true);
                Toastify({
                    text: "Completed",
                    duration: 3000, 
                    close: true,
                    gravity: "top", 
                    position: "right",
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                    stopOnFocus: true, 
                }).showToast();
                restartButton.disabled = false
                restartButton.style.backgroundColor = '#34D399'; 
                restartButton.style.color = '#fff'; 
                restartButton.style.cursor = 'pointer';

            }
        }catch(error){
            Toastify({
                text: error,
                duration: 3000, 
                close: true,
                gravity: "top", 
                position: "right",
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                stopOnFocus: true, 
            }).showToast();
           
            Toastify({
                text: `Error importing tasks:${error}`,
                duration: 3000, 
                close: true,
                gravity: "top", 
                position: "right",
                backgroundColor: "linear-gradient(to right,#FF0000, #FFFFFF)",
                stopOnFocus: true, 
            }).showToast();

            updateStatus('Error');
            restartButton.disabled = false;

        }
    }

    async function processBatch(batch){
        // simulating network delay, to simulate batch processing
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    function updateProgress(){
        const percentage = Math.round((completedTasks / totalTasks) * 100)
        progressBar.style.width = `${percentage}%`
        progressPercentage.textContent = `${percentage}%`
    }

    function updateStatus(status){
        progressText.textContent = status
    }

    cancelButton.addEventListener('click', () => {
        isCancelled = true
        Toastify({
            text: "Canceled",
            duration: 3000, 
            close: true,
            gravity: "top", 
            position: "right",
            backgroundColor: "linear-gradient(to right,#FF0000, #FFFFFF)",
            stopOnFocus: true, 
        }).showToast();
        restartButton.disabled = false
        restartButton.style.backgroundColor = '#34D399'; 
        restartButton.style.color = '#fff'; 
        restartButton.style.cursor = 'pointer';
    });

    // getting the stored status from localstore to know if it was initially completed or not
    let taskStatus = localStorage.getItem("completed")
    if(!taskStatus){
        importTasks();
    }else{
        progressBar.style.width = "100%"
        progressPercentage.textContent = "100%"
    }

    function refreshTask(){
        localStorage.removeItem("completed")
        localStorage.removeItem("completedTasks")
        completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
        batchSize = 10
        totalTasks = 0
        isCancelled = false
        // localStorage.getItem("completedTasks")

        importTasks()
        updateStatus('In Progress')
        Toastify({
            text: "Restarted",
            duration: 3000, 
            close: true,
            gravity: "top", 
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            stopOnFocus: true, 
        }).showToast();
    }

    restartButton.addEventListener("click", refreshTask)
});


let random = 0

let container = []

function myFunction() {

    random = Math.floor(Math.random() * 90 + 1);


    if (container.includes(random)) {

        myFunction();

    } else {
        container.push(random);

        document.getElementById("demo").innerHTML = random;

        document.getElementById("n-"+ random).classList.add("last");

        document.getElementById("n-"+ random).classList.add("done");

        if(container.length == 86){
            alert("Housie !!!")
        }

    }

}

// document.getElementsByClassName("gen-btn").onclick = function() {removeLast()};

//show last/current number in red
function removeLast(){
    let lastnum = container.length-2;
    document.getElementById("n-"+ container[lastnum]).classList.remove("last");
}


function reloadPage(){
    window.location.reload();
 }

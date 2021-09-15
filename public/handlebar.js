function hideHandleBar() {
    setTimeout(() => {
        let handlebar = document.getElementById("success-msg");
        if (handlebar !== null)
            handlebar.style.display = "none";
    }, 2000)
}

let numOfTodos = document.getElementById("todos").children.length
if (numOfTodos > 3) {
    hideHandleBar()
}


let checkBoxes = document.getElementsByClassName("check-class")
let deleteButton = document.getElementsByClassName("deleteButton")[0]

for (let i = 0; i < checkBoxes.length; i++) {
    let item = checkBoxes[i];
    item.addEventListener("change", () => {
        if (itemsForDeletion()) {
            deleteButton.style.display = "inline"
        }
        else {
            deleteButton.style.display = "none"
        }
    })
}

let itemsForDeletion = () => {
    let result = false;
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            result = true
            break
        }
    }
    return result
}
import axios from 'axios'
// import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(shoes) {
    axios.post('/update-cart', shoes).then(res => {
        cartCounter.innerText = res.data.totalQty
        // new Noty({
        //     type: 'success',
        //     layout: 'topLeft',
        //     timeout: 1000, //1 second
        //     text: "Item added to cart",
        //     progressBar: false,
        // }).show();
    }).catch(err => {
        // new Noty({
        //     type: 'error',
        //     layout: 'topLeft',
        //     timeout: 1000, //1 second
        //     text: "OOPS! Something went wrong",
        //     progressBar: false,
        // }).show();
    })
}


addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        console.log(e)
        let shoes = JSON.parse(btn.dataset.shoes)
        updateCart(shoes)
    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)   //2 secs
}

// initAdmin()

// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;          //first status will be always true i.e gray
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}

updateStatus(order);

// Socket
let socket = io()



// Join
if(order) {
    socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})
import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.render(element)
        thisBooking.initWidgets()
    }

    render(element) {
        const thisBooking = this

        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {}
        thisBooking.dom.widget = element
        thisBooking.dom.widget.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount)
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount)
    }

    initWidgets() {
        const thisBooking = this

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.peopleAmountWidget.initActions();
        thisBooking.dom.peopleAmount.addEventListener('updated', function () { })

        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.hoursAmountWidget.initActions();
        thisBooking.dom.hoursAmount.addEventListener('updated', function () { })
    }
}

export default Booking

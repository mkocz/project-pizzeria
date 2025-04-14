import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import HourPicker from "./HourPicker.js";
import DatePicker from "./DatePicker.js";

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
        thisBooking.dom.date = document.querySelector(select.widgets.datePicker.wrapper)
        thisBooking.dom.hour = document.querySelector(select.widgets.hourPicker.wrapper)
    }

    initWidgets() {
        const thisBooking = this

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function () { })

        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function () { })

        thisBooking.datePicker = new DatePicker(thisBooking.dom.date);
        thisBooking.dom.date.addEventListener('updated', function () { })

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hour);
        thisBooking.dom.hour.addEventListener('updated', function () { })
    }
}

export default Booking

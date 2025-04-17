import { classNames, select, settings, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import HourPicker from "./HourPicker.js";
import DatePicker from "./DatePicker.js";
import utils from "../utils.js"

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.starters = [];
        thisBooking.table = null;
        thisBooking.render(element);
        thisBooking.initWidgets()
        thisBooking.getData();
        thisBooking.initTables();
        thisBooking.initStarters();
        thisBooking.initForm()
    }

    getData() {
        const thisBooking = this

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                startDateParam
            ]
        }

        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
        }

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat)
        ])
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json()
                ])
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
            })
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this
        thisBooking.booked = {}
        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
                }
            }
        }

        thisBooking.updateDOM()
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {}
        }

        const startHour = utils.hourToNumber(hour)

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = []
            }

            thisBooking.booked[date][hourBlock].push(table)
        }
    }

    updateDOM() {
        const thisBooking = this;
        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
        thisBooking.duration = thisBooking.hoursAmountWidget.value;

        for (let table of thisBooking.dom.tables) {

            let tableId = table.getAttribute(settings.booking.tableIdAttribute)

            if (!isNaN(tableId)) {
                tableId = parseInt(tableId)
            }

            for (let hour = thisBooking.hour; hour < thisBooking.hour + thisBooking.duration; hour += 0.5) {
                const allAvailable =
                    typeof thisBooking.booked[thisBooking.date] == 'undefined'
                    ||
                    typeof thisBooking.booked[thisBooking.date][hour] == 'undefined'

                if (!allAvailable && thisBooking.booked[thisBooking.date][hour].includes(tableId)) {
                    table.classList.add(classNames.booking.tableBooked);
                    break;
                } else {
                    table.classList.remove(classNames.booking.tableBooked)
                }
            }
        }
    }

    render(element) {
        const thisBooking = this

        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {}
        thisBooking.dom.widget = element
        thisBooking.dom.widget.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.widget.querySelector(select.booking.peopleAmount)
        thisBooking.dom.hoursAmount = thisBooking.dom.widget.querySelector(select.booking.hoursAmount)
        thisBooking.dom.date = thisBooking.dom.widget.querySelector(select.widgets.datePicker.wrapper)
        thisBooking.dom.hour = thisBooking.dom.widget.querySelector(select.widgets.hourPicker.wrapper)
        thisBooking.dom.tables = thisBooking.dom.widget.querySelectorAll(select.booking.tables)
        thisBooking.dom.tablesWrapper = thisBooking.dom.widget.querySelector(select.booking.tablesWrapper)
        thisBooking.dom.address = thisBooking.dom.widget.querySelector(select.booking.address)
        thisBooking.dom.phone = thisBooking.dom.widget.querySelector(select.booking.phone)
        thisBooking.dom.starters = thisBooking.dom.widget.querySelector(select.booking.starters)
        thisBooking.dom.form = thisBooking.dom.widget.querySelector(select.booking.form)
        thisBooking.dom.successMessage = thisBooking.dom.widget.querySelector(select.booking.successMessage)
    }

    initWidgets() {
        const thisBooking = this

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.date);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hour);

        thisBooking.dom.widget.addEventListener('updated', function () {
            thisBooking.updateDOM()
            thisBooking.resetTables();
        })
    }

    initTables() {
        const thisBooking = this

        thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
            const selectedTable = event.target.closest(select.booking.table)
            if (!selectedTable) return

            const tableId = parseInt(selectedTable.getAttribute(settings.booking.tableIdAttribute))

            if (selectedTable.classList.contains(classNames.booking.tableBooked)) {
                alert('Stolik niedostepny')
            } else if (!selectedTable.classList.contains(classNames.booking.tableSelected)) {
                thisBooking.resetTables()
                selectedTable.classList.add(classNames.booking.tableSelected);
                thisBooking.table = tableId;
                thisBooking.date = thisBooking.datePicker.value;
                thisBooking.hour = thisBooking.hourPicker.value;
            } else {
                selectedTable.classList.remove(classNames.booking.tableSelected);
                thisBooking.table = null
            }
        })
    }

    resetTables() {
        const thisBooking = this

        for (let table of thisBooking.dom.tables) {
            table.classList.remove(classNames.booking.tableSelected);
            thisBooking.table = null;
        }
    }

    initResetMessage() {
        const thisBooking = this
        thisBooking.dom.widget.addEventListener('click', function () {
            thisBooking.dom.successMessage.classList.remove(classNames.booking.messageVisible)
        }, { once: true })
    }

    initStarters() {
        const thisBooking = this
        thisBooking.dom.starters.addEventListener('click', function (event) {
            if (
                event.target.tagName === "INPUT" &&
                event.target.type === "checkbox" &&
                event.target.name === "starter"
            ) {
                if (event.target.checked) {
                    thisBooking.starters.push(event.target.value);
                } else {
                    const index = thisBooking.starters.indexOf(event.target.value);
                    thisBooking.starters.splice(index, 1);
                }
            }
        })
    }

    initForm() {
        const thisBooking = this

        thisBooking.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (thisBooking.table) {
                thisBooking.sendBooking();
            }
        })
    }

    resetBooking() {
        const thisBooking = this

        thisBooking.table = null;
        thisBooking.starters = [];
        thisBooking.render(document.querySelector(select.containerOf.booking));
        thisBooking.initWidgets();
        thisBooking.initTables();
        thisBooking.initStarters();
        thisBooking.initForm();
    }

    sendBooking() {
        const thisBooking = this
        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = {
            "date": thisBooking.datePicker.value,
            "hour": thisBooking.hourPicker.value,
            "table": thisBooking.table,
            "duration": thisBooking.hoursAmountWidget.value,
            "ppl": thisBooking.peopleAmountWidget.value,
            "starters": thisBooking.starters,
            "phone": thisBooking.dom.phone.value,
            "address": thisBooking.dom.address.value
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function () {
                thisBooking.makeBooked(thisBooking.date, thisBooking.hour, thisBooking.hoursAmountWidget.value, thisBooking.table);
                thisBooking.resetBooking();
                thisBooking.dom.successMessage.classList.add(classNames.booking.messageVisible);
                thisBooking.initResetMessage()
            });
    }
}

export default Booking

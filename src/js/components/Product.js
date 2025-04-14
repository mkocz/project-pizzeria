import { select, classNames, templates } from "../settings.js";
import utils from "../utils.js"
import AmountWidget from "./AmountWidget.js";

class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.renderInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }

    renderInMenu() {
        const thisProduct = this;

        const generatedHTML = templates.menuProduct(thisProduct.data);
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        const menuContainer = document.querySelector(select.containerOf.menu);
        menuContainer.appendChild(thisProduct.element)
    }

    getElements() {
        const thisProduct = this;

        thisProduct.dom = {}
        thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
        thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
        thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
        thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
        thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
        const thisProduct = this;

        /* START: add event listener to clickable trigger on event click */
        thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
            /* prevent default action for event */
            event.preventDefault();
            /* find active product (product that has active class) */
            const activeProduct = document.querySelector('.product.active')
            /* if there is active product and it's not thisProduct.element, remove class active from it */
            if (activeProduct && (activeProduct !== thisProduct.element)) {
                activeProduct.classList.remove('active')
            }
            /* toggle active class on thisProduct.element */
            thisProduct.element.classList.toggle('active')
        });
    }

    initOrderForm() {
        const thisProduct = this;

        thisProduct.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
        });

        for (let input of thisProduct.dom.formInputs) {
            input.addEventListener('change', function () {
                thisProduct.processOrder();
            });
        }

        thisProduct.dom.cartButton.addEventListener('click', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
            thisProduct.addToCart();
            thisProduct.resetProduct();
        });
    }

    resetProduct() {
        const thisProduct = this;

        const generatedHTML = templates.menuProduct(thisProduct.data);
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        const menuContainer = document.querySelector(select.containerOf.menu);
        const productElem = menuContainer.querySelector('.product.active')
        productElem.parentNode.replaceChild(thisProduct.element, productElem)
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }

    processOrder() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.dom.form)

        // set price to default price
        let price = thisProduct.data.price;

        // for every category (param)...
        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];

            // for every option in this category
            for (let optionId in param.options) {
                const option = param.options[optionId];
                const ingredientElement = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId)

                if (formData[paramId].includes(optionId)) {
                    if (!option['default']) {
                        price = price + option.price;
                    }
                    if (ingredientElement) {
                        ingredientElement.classList.add(classNames.menuProduct.imageVisible)
                    }
                } else {
                    if (option['default']) {
                        price = price - option.price;
                    }
                    if (ingredientElement) {
                        ingredientElement.classList.remove(classNames.menuProduct.imageVisible)
                    }
                }
            }
        }

        thisProduct.singlePrice = price;

        // update calculated price in the HTML
        price *= thisProduct.amountWidget.value;
        thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget() {
        const thisProduct = this;

        thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
        thisProduct.amountWidget.renderValue();
        thisProduct.dom.amountWidgetElem.addEventListener('updated', function () { thisProduct.processOrder() })
    }

    addToCart() {
        const thisProduct = this;

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        }
        );
        thisProduct.element.dispatchEvent(event);
    }


    prepareCartProduct() {
        const thisProduct = this;

        const productSummary = {
            id: thisProduct.id,
            name: thisProduct.data.name,
            amount: thisProduct.amountWidget.value,
            singlePrice: thisProduct.singlePrice,
            price: thisProduct.singlePrice * thisProduct.amountWidget.value,
            params: thisProduct.prepareCartProductParams()
        }

        return productSummary
    }

    prepareCartProductParams() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.dom.form)
        const productParams = {};

        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];
            productParams[paramId] = {
                label: param.label,
                options: {}
            };

            for (let optionId in param.options) {
                const option = param.options[optionId];

                if (formData[paramId].includes(optionId)) {
                    productParams[paramId].options[optionId] = option.label;
                }
            }
        }

        return productParams
    }
}

export default Product

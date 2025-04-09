import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct {
    constructor(menuProduct, element) {
        const thisCartProduct = this;
        thisCartProduct.id = menuProduct.id;
        thisCartProduct.name = menuProduct.name;
        thisCartProduct.amount = menuProduct.amount;
        thisCartProduct.price = menuProduct.price;
        thisCartProduct.singlePrice = menuProduct.singlePrice;
        thisCartProduct.params = menuProduct.params;

        thisCartProduct.getElements(element);
        thisCartProduct.initAmountWidget();
        thisCartProduct.initActions();
    }

    getElements(element) {
        const thisCartProduct = this;

        thisCartProduct.dom = {};
        thisCartProduct.dom.wrapper = element;
        thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
        thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
        thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
        thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
        const thisCartProduct = this;

        thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
        thisCartProduct.amountWidget.initActions();
        thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
            thisCartProduct.amount = thisCartProduct.amountWidget.value;
            thisCartProduct.price = thisCartProduct.amount * thisCartProduct.singlePrice;
            thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        })
    }

    remove() {
        const thisCartProduct = this;

        const event = new CustomEvent('remove', {
            bubbles: true,
            detail: {
                cartProduct: thisCartProduct
            }
        })

        thisCartProduct.dom.wrapper.dispatchEvent(event)
    }

    initActions() {
        const thisCartProduct = this;
        thisCartProduct.dom.remove.addEventListener('click', function () {
            thisCartProduct.remove();
        });
        thisCartProduct.dom.edit.addEventListener('click', function () {
        });
    }

    getData() {
        const thisCartProduct = this;

        const cartProductSummary = {
            id: thisCartProduct.id,
            name: thisCartProduct.name,
            amount: thisCartProduct.amount,
            singlePrice: thisCartProduct.singlePrice,
            price: thisCartProduct.price,
            params: thisCartProduct.params
        }

        return cartProductSummary
    }
}

export default CartProduct

import React from "react";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
import { toast } from "react-toastify";
import { connect } from "react-redux";

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.onToken = this.onToken.bind(this);
  }

  // to get the value from this request, convert to async await syntax
  async onToken(token, addresses) {
    // send with the axios post the token (which includes all address data)
    // and product data coming from redux state
    // await the post request to assign the value of that to a variable

    const cartPayload = {
      orderString: this.getOrderString(this.props.checkoutItems),
      totalPrice: this.getOrderPrice(this.props.checkoutItems)
    }

    const response = await axios.post("/charge", {
      token,
      checkoutItems: cartPayload
    });
    // get status from that request (being returned from server side code)
    const { status } = response.data;
    if (status === "success") {
      toast("Success! Check email for details.", { type: "success" });
    } else {
      toast("Something went wrong", { type: "error" });
    }
  }

  // =================================================================================================
  // create final order string fn
  // the code utilizes Set object to store a collection of unique values
  // by mapping the existing array into a new array by item titles from redux state
  getOrderString(reduxState) {
    let orderString = [...new Set(reduxState.map(item => item.data.title))];
    return orderString.join(', ');
  }

  // get order price fn
  // add all item prices to a total variable and return that var
  getOrderPrice(reduxState) {
    let total = 0;
    reduxState.forEach(item => {
      total += item.data.price;
    });
    return total;
  }

  render() {
    return (
      <div>
        <StripeCheckout
          stripeKey="" // stripe pk here
          token={this.onToken}
          billingAddress
          shippingAddress
          // multiply dollar amounts by 100 to convert to cents
          amount={this.getOrderPrice(this.props.checkoutItems) * 100}
          name={this.getOrderString(this.props.checkoutItems)}
        />
        <h2>Order: {this.getOrderString(this.props.checkoutItems)}</h2>
        <h2>Price: {this.getOrderPrice(this.props.checkoutItems)}</h2>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  checkoutItems: state.checkoutItems.items
});

export default connect(mapStateToProps, null)(Checkout);

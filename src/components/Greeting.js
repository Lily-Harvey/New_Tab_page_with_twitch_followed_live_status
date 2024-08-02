import React from "react";

const Greeting = ({ greeting, name }) => (
  <div className="greeting-container">
    <h1>{greeting} {name}!</h1>
  </div>
);

export default Greeting;

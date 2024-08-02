import React from "react";

const Greeting = ({ greeting, name }) => (
  <div className="greeting-container">
    <h1>{greeting} {name}!</h1> {/* Display the greeting and name */}
  </div>
);

export default Greeting;

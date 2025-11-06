import type { BookInstance } from "../types";

interface instanceProp {
  instance: BookInstance;
}

function Copies({ instance }: instanceProp) {
  return (
    <div className="instance-div">
      <div
        className={
          instance.status === "a"
            ? "available"
            : instance.status === "m"
            ? "maintenance"
            : instance.status === "o"
            ? "on-loan"
            : instance.status === "r"
            ? "reserved"
            : ""
        }
      >
        {instance.status_display}
      </div>
      <div>
        <span className="instance-detail">Imprint: </span>
        {instance.imprint}
      </div>
      <div>
        <span className="instance-detail">Id: </span>
        {instance.id}
      </div>
    </div>
  );
}

export default Copies;

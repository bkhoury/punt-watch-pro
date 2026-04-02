// Filters shown on the punt listings page

import Tag from "@/src/components/Tag.jsx";

function FilterSelect({ label, options, value, onChange, name, icon }) {
  return (
    <div>
      <img src={icon} alt={label} />
      <label>
        {label}
        <select value={value} onChange={onChange} name={name}>
          {options.map((option, index) => (
            <option value={option} key={index}>
              {option === "" ? "All" : option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function PuntFilters({ filters, setFilters, users = [] }) {
  const handleSelectionChange = (event, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const updateField = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Punts</p>
            <p>Sorted by {filters.sort || "Date Created"}</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <FilterSelect
            label="Min Hangtime"
            options={["", "2s+", "3s+", "4s+", "5s+"]}
            value={filters.hangtime}
            onChange={(event) => handleSelectionChange(event, "hangtime")}
            name="hangtime"
            icon="/sortBy.svg"
          />

          <FilterSelect
            label="Min Distance"
            options={["", "30yd+", "40yd+", "50yd+", "60yd+"]}
            value={filters.distance}
            onChange={(event) => handleSelectionChange(event, "distance")}
            name="distance"
            icon="/location.svg"
          />

          <FilterSelect
            label="Sort"
            options={["Date Created", "Hangtime", "Distance"]}
            value={filters.sort}
            onChange={(event) => handleSelectionChange(event, "sort")}
            name="sort"
            icon="/sortBy.svg"
          />

          <div>
            <label>
              Punter
              <select
                value={filters.uid}
                onChange={(event) => {
                  const selected = users.find((u) => u.uid === event.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    uid: event.target.value,
                    userName: selected ? selected.displayName : "",
                  }));
                }}
                name="uid"
              >
                <option value="">All</option>
                {users.map((u) => (
                  <option value={u.uid} key={u.uid}>
                    {u.displayName} — {u.position}, {u.team}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    hangtime: "",
                    distance: "",
                    sort: "",
                    uid: "",
                    userName: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {filters.userName && (
          <Tag
            key="userName"
            type="userName"
            value={`Punter: ${filters.userName}`}
            updateField={(_type, val) => {
              setFilters((prev) => ({ ...prev, uid: val, userName: val }));
            }}
          />
        )}
        {Object.entries(filters).map(([type, value]) => {
          if (type === "sort" || type === "uid" || type === "userName" || value === "") {
            return null;
          }
          return (
            <Tag
              key={type}
              type={type}
              value={value}
              updateField={updateField}
            />
          );
        })}
      </div>
    </section>
  );
}

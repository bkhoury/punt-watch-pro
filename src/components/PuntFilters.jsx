// Filters shown on the punt listings page

import Tag from "@/src/components/Tag.jsx";

function FilterRange({ label, minRange, maxRange, value, onChange, name, icon }) {
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
  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Reps</p>
            <p>Filter by Specialist</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
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
      </div>
    </section>
  );
}


export function SpecialistFilters({ filters, setFilters, users = [] }) {
  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Reps</p>
            <p>Filter by Specialist</p>
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
            label="Position"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />
                  <FilterSelect
            label="High School Class Year"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />
                            <FilterSelect
            label="Years of Eligibility Remaining"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />
                            <FilterSelect
            label="GPA"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />
                            <FilterSelect
            label="ACT Score"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />
                            <FilterSelect
            label="SAT Score"
            options={[
              "",
              "Kicker",
              "Punter",
              "Snapper",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
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
      </div>
    </section>
  );
}

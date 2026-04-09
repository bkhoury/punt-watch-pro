import PuntListings from "@/src/components/PuntListings.jsx";

export default async function RepsPage(props) {
  const searchParams = await props.searchParams;
  console.log("Search params in RepsPage:", searchParams);
  return (
    <main className="main__home">
      <PuntListings searchParams={searchParams} />
    </main>
  );
}

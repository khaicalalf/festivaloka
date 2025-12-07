import mapImg from "../../assets/map/DenahTenant.png";

export default function MapForm() {
  return (
    <div className="w-full max-h-60 overflow-hidden border rounded mx-auto">
      <img
        src={mapImg}
        alt="peta lokasi"
        className="w-full h-auto object-contain rounded"
        draggable={false}
      />
    </div>
  );
}

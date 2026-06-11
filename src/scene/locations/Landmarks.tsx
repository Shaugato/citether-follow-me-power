import { Business } from "./Business";
import { Charity } from "./Charity";
import { CommunityPod } from "./CommunityPod";
import { EVCoast } from "./EVCoast";
import { Grid } from "./Grid";
import { Home } from "./Home";
import { Hospital } from "./Hospital";
import { JobSite } from "./JobSite";
import { MumsFlat } from "./MumsFlat";

export function Landmarks() {
  return (
    <group>
      <Home />
      <MumsFlat />
      <JobSite />
      <EVCoast />
      <Hospital />
      <CommunityPod />
      <Charity />
      <Business />
      <Grid />
    </group>
  );
}

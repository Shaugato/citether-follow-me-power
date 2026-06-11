import { CaptionStrip } from "./CaptionStrip";
import { DevControls } from "./DevControls";
import { EndCard } from "./EndCard";
import { EconomicsSankey } from "./EconomicsSankey";
import { EventLog } from "./EventLog";
import { ExplanationCard } from "./ExplanationCard";
import { ImpactSummary } from "./ImpactSummary";
import { LedgerPanel } from "./LedgerPanel";
import { LayerLegend } from "./LayerLegend";
import { MetricChip } from "./MetricChip";
import { ModeChip } from "./ModeChip";

export function OverlaySystem() {
  return (
    <div className="overlay-system">
      <ModeChip />
      <LayerLegend />
      <MetricChip />
      <LedgerPanel />
      <ExplanationCard />
      <EventLog />
      <ImpactSummary />
      <EconomicsSankey />
      <EndCard />
      <CaptionStrip />
      <DevControls />
    </div>
  );
}

import { LandingLayout } from "../layouts/LandingLayout";
import { useAbout } from "../components/about/useAbout";
import { MISSION_ITEM_KEYS } from "../components/about/AboutShared";
import { AboutHero } from "../components/about/AboutHero";
import { AboutIntro } from "../components/about/AboutIntro";
import { AboutHistory } from "../components/about/AboutHistory";
import { AboutVisionMission } from "../components/about/AboutVisionMission";
import { AboutTeam } from "../components/about/AboutTeam";
import { AboutLegal } from "../components/about/AboutLegal";

function TentangKamiPage() {
  const {
    locale,
    t,
    loadingMembers,
    errorMembersKey,
    groupedMembers,
    timelineCards,
    missionList,
    valueCards,
    legalItems
  } = useAbout();

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      <AboutHero t={t} />
      <AboutIntro t={t} />
      <AboutHistory t={t} timelineCards={timelineCards} />
      <AboutVisionMission 
        t={t} 
        missionList={missionList} 
        missionItemKeys={MISSION_ITEM_KEYS} 
        valueCards={valueCards} 
      />
      <AboutTeam 
        t={t} 
        locale={locale} 
        loadingMembers={loadingMembers} 
        errorMembersKey={errorMembersKey} 
        groupedMembers={groupedMembers} 
      />
      <AboutLegal t={t} legalItems={legalItems} />
    </LandingLayout>
  );
}

export default TentangKamiPage;
export { TentangKamiPage };

<GameProjectFile>
  <PropertyGroup Type="Node" Name="Turn" ID="5494ab10-f766-4d6c-9920-f6b27d17aac5" Version="2.3.2.3" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="80" Speed="1.0000" ActivedAnimationName="pop">
        <Timeline ActionTag="-363713215" Property="Position">
          <PointFrame FrameIndex="0" X="-640.0000" Y="0.0000">
            <EasingData Type="17" />
          </PointFrame>
          <PointFrame FrameIndex="30" X="0.0000" Y="0.0000">
            <EasingData Type="23" />
          </PointFrame>
          <PointFrame FrameIndex="50" X="0.0000" Y="0.0000">
            <EasingData Type="17" />
          </PointFrame>
          <PointFrame FrameIndex="80" X="640.0000" Y="0.0000">
            <EasingData Type="0" />
          </PointFrame>
        </Timeline>
        <Timeline ActionTag="-363713215" Property="Scale">
          <ScaleFrame FrameIndex="0" X="1.0000" Y="1.0000">
            <EasingData Type="17" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="30" X="1.0000" Y="1.0000">
            <EasingData Type="23" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="50" X="1.0000" Y="1.0000">
            <EasingData Type="17" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="80" X="1.0000" Y="0.0100">
            <EasingData Type="0" />
          </ScaleFrame>
        </Timeline>
        <Timeline ActionTag="-363713215" Property="RotationSkew">
          <ScaleFrame FrameIndex="0" X="0.0000" Y="0.0000">
            <EasingData Type="17" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="30" X="0.0000" Y="0.0000">
            <EasingData Type="23" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="50" X="0.0000" Y="0.0000">
            <EasingData Type="17" />
          </ScaleFrame>
          <ScaleFrame FrameIndex="80" X="0.0000" Y="0.0000">
            <EasingData Type="0" />
          </ScaleFrame>
        </Timeline>
      </Animation>
      <AnimationList>
        <AnimationInfo Name="pop" StartIndex="0" EndIndex="80">
          <RenderColor A="255" R="255" G="228" B="196" />
        </AnimationInfo>
      </AnimationList>
      <ObjectData Name="Node" Tag="12" ctype="GameNodeObjectData">
        <Size X="0.0000" Y="0.0000" />
        <Children>
          <AbstractNodeData Name="Panel_1" ActionTag="-363713215" Tag="1" IconVisible="False" LeftMargin="-960.0000" RightMargin="320.0000" TopMargin="-75.0000" BottomMargin="-75.0000" TouchEnable="True" BackColorAlpha="0" ComboBoxIndex="2" ColorAngle="90.0000" ctype="PanelObjectData">
            <Size X="640.0000" Y="150.0000" />
            <Children>
              <AbstractNodeData Name="Text_1" ActionTag="-1373686397" Tag="10" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="BothEdge" LeftMargin="211.5000" RightMargin="211.5000" TopMargin="38.0000" BottomMargin="38.0000" FontSize="100" LabelText="턴 변경!" OutlineSize="6" OutlineEnabled="True" ShadowOffsetX="0.0000" ShadowOffsetY="-6.0000" ShadowEnabled="True" ctype="TextObjectData">
                <Size X="301.0000" Y="115.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="320.0000" Y="75.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="170" G="211" B="255" />
                <PrePosition X="0.5000" Y="0.5000" />
                <PreSize X="0.3391" Y="0.4933" />
                <FontResource Type="Normal" Path="bmjua.ttf" Plist="" />
                <OutlineColor A="255" R="0" G="101" B="255" />
                <ShadowColor A="255" R="0" G="49" B="162" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="-640.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition />
            <PreSize X="0.0000" Y="0.0000" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="2" G="0" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameProjectFile>
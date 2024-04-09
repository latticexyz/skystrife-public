import React from "react";

type Props = {
  children: React.ReactNode;
};

const Title = ({ children }: Props) => <h1 className="text-[40px]">{children}</h1>;
const SubTitle = ({ children }: Props) => <h2 className="text-[32px] mt-6">{children}</h2>;
const Paragraph = ({ children }: Props) => <p className="mt-4 text-[20px] text-ss-text-light font-thin">{children}</p>;
const List = ({ children }: Props) => (
  <ul className="list-disc list-inside mb-2 text-[20px] text-ss-text-light font-thin">{children}</ul>
);
const ListItem = ({ children }: Props) => <li className="mt-2 px-8">{children}</li>;

const PrivacyPolicy = () => (
  <div className="100vw 100vh">
    <div className="max-w-[640px] mx-auto p-4">
      <Title>Sky Strife Global Privacy Policy</Title>
      <SubTitle>Last updated: Mar 1, 2024</SubTitle>
      <Paragraph>
        Please read this Privacy Policy (“Privacy Policy”) carefully. It provides information about how Lattice Labs Ltd
        (“Lattice”, “we”, “us”, and “our”) collects, uses, shares, and otherwise processes personal information. If you
        have any questions, comments, or concerns please contact us using the methods provided in the “Contact Us”
        section of this Privacy Policy below.
      </Paragraph>
      <SubTitle>1. Scope Of This Privacy Policy</SubTitle>
      <Paragraph>
        Lattice Labs Ltd is a company incorporated in the United Kingdom under the laws of the Companies Act 2006.
      </Paragraph>
      <Paragraph>
        This Privacy Policy applies to personal information that Lattice collects, uses, shares, and otherwise processes
        when you interact with our website https://skystrife.xyz/ (the “Site”), and any other services offered through
        the Site, collectively referred to as the “Sky Strife Services” within this policy.
      </Paragraph>
      <Paragraph>
        Sky Strife is a fully on-chain real-time strategy game built on MUD, running on Redstone. The Redstone protocol
        (whether the mainnet or testnet version) is an open source, layer-two optimistic rollup protocol that operates
        with the Ethereum blockchain (the “Protocol”). However, the Protocol is not part of the Sky Strife Services. We
        do not control all activity and data on the Protocol itself and it is outside the scope of this Privacy Policy.
      </Paragraph>
      <Paragraph>
        By visiting, accessing, or using the Sky Strife Services, you acknowledge and agree that you have received and
        reviewed this Privacy Policy.
      </Paragraph>
      <Paragraph>
        From time to time, we may update this Privacy Policy as described in the Changes to this Privacy Policy section
        below.
      </Paragraph>
      <Paragraph>
        We take privacy seriously and are committed to safeguarding the personal data of our users and developers (“you”
        and “your” or “Users” and “Developers,” as relevant). It&apos;s important to understand that we do not exercise
        control over third-party websites, applications, or services, and we bear no responsibility for their actions.
        We encourage you to review the privacy policies of any external websites, decentralized applications, or
        services you may use to access or interact with the Sky Strife Services.
      </Paragraph>
      <SubTitle>2. What Information We Collect</SubTitle>
      <Paragraph>
        As used in this Privacy Policy, “personal information” means any information that identifies or could be used to
        identify an individual person. For example, personal information may include name, email address, and phone
        number. It also includes other non-public information that we associate with such identifying information.
        Personal information does not include aggregated or anonymized information. We understand that many of our users
        value the anonymity available within a blockchain-based environment. We strive to limit the information we
        collect to anonymous information, but we do collect and process some personal information to enable and provide
        the Sky Strife Services.
      </Paragraph>
      <Paragraph>We collect the following types of personal information, as described below.</Paragraph>
      <SubTitle>Information You Provide</SubTitle>
      <List>
        <ListItem>Your public wallet address (“Wallet Address”).</ListItem>
        <ListItem>Publicly available blockchain data (“Blockchain Data”).</ListItem>
        <ListItem>
          Where you agree to engage in support requests, inquiries, feedback, surveys, questionnaires, research. If you
          contact us, such as by sending an email or submitting feedback, we may collect your name, email address, phone
          number, social media handles, and any other information you choose to include in your message.
        </ListItem>
        <ListItem>
          Interactions through social media and other third-party platforms. If you interact with us through any
          third-party platforms, such as our pages on Github or Discord, or through any of our pages or feeds on social
          media sites or platforms, such as Twitter/X, we may collect information such as your name, username,
          demographic information, contact information such as email address, location, and publicly-posted data such as
          your social media activity.
        </ListItem>
        <ListItem>
          Attending Events. If you sign up for or attend a webinar or other Sky Strife event hosted by Lattice, we
          collect registration and attendance information.
        </ListItem>
      </List>
      <SubTitle>Information Collected Automatically</SubTitle>
      <Paragraph>
        When you access or use the Sky Strife Services, we or our third-party agents or service providers automatically
        collect information about the device you use to access them and your activity when you use them. Depending on
        your activity, the information may include:
      </Paragraph>
      <List>
        <ListItem>
          Device and Usage Information: We collect certain information about your device and how you interact with the
          Sky Strife Services each time you access or use it.
        </ListItem>
        <ListItem>
          Device information may include your IP address, browser type and version, browser settings, time zone, unique
          device identifiers, information about your approximate location (as determined through your IP address),
          mobile, computer, and/or device hardware information (e.g., operating system version, hardware model, IMEI
          number, and other unique device identifiers, MAC address, and device settings), device event information, log
          information, and crash data.
        </ListItem>
        <ListItem>
          Usage information may include features that you use, clickstream data, access dates and times, and how you
          interact with the Sky Strife Services. This information may also include referring / exit pages and URLs, how
          you interact with links on the Website, landing pages, and pages viewed.
        </ListItem>
        <ListItem>
          Cookies and Other Tracking Technologies: We and our third-party service providers or agents may collect
          information using one or more Cookies or similar technologies such as pixels or locally stored objects
          (collectively “Cookies”). Cookies may collect information such as your IP address, unique device identifiers,
          and your browser settings.
        </ListItem>
      </List>
      <SubTitle>Information we obtain from third parties</SubTitle>
      <Paragraph>
        In some instances, we collect and process personal information we receive from third parties, which can include
        the following:
      </Paragraph>
      <List>
        <ListItem>
          Blockchain Data: We may analyze public blockchain data, including timestamps of transactions or events,
          transaction IDs, digital signatures, transaction amounts and wallet addresses
        </ListItem>
        <ListItem>
          Information from Analytics Providers: We receive information about your website usage and interactions from
          third party analytics providers. This includes browser fingerprint, device information, and IP address.
        </ListItem>
        <ListItem>
          Error Tracking Data: We utilize information from third party service providers to provide automated error
          monitoring, reporting, alerting and diagnostic capture for website errors to allow Users or Developers to use
          or build more effectively on the Sky Strife Services.
        </ListItem>
      </List>
      <SubTitle>3. How We Use Your Information</SubTitle>
      <Paragraph>We use the personal information we collect in the following ways:</Paragraph>
      <List>
        <ListItem>To provide and operate the Sky Strife Services;</ListItem>
        <ListItem>
          To respond to your inquiries and requests, or otherwise communicate with you, and to provide you with
          assistance related to the Sky Strife Services;
        </ListItem>
        <ListItem>
          To provide technical support for, secure, and protect the Sky Strife Services, including to detect and prevent
          fraud, abuse, or security risks, and to track outages and troubleshoot;
        </ListItem>
        <ListItem>
          To conduct analytics related to the Sky Strife Services, such as to understand how it is being used and where
          improvements may be needed;
        </ListItem>
        <ListItem>To improve user experience with the Sky Strife Services;</ListItem>
        <ListItem>
          To update, improve, and/or enhance the Sky Strife Services, and develop new features, more functionality;
        </ListItem>
        <ListItem>
          To send you newsletters and promotional and marketing communications that may be of interest to you;
        </ListItem>
        <ListItem>
          To better understand your personal preferences and to enable us to provide you with improved and personalized
          communications;
        </ListItem>
        <ListItem>
          To resolve disputes or otherwise to carry out our obligations and enforce our rights, and to protect our
          business interest and rights of third parties;
        </ListItem>
        <ListItem>To audit our compliance with legal and contractual requirements and internal policies;</ListItem>
        <ListItem>
          To comply with legal and contractual obligations and requirements, law enforcement requests, and legal
          process;
        </ListItem>
      </List>
      <SubTitle>4. How And Why We Share Your Information</SubTitle>
      <Paragraph>
        We transmit, share, grant access, make available and provide personal information to or with the following types
        of third parties.
      </Paragraph>
      <SubTitle>Service Providers:</SubTitle>
      <Paragraph>
        We share personal information with our third-party vendors, consultants, agents, contractors, and service
        providers that help us provide the Sky Strife Services. Depending on how you use the Sky Strife Services, the
        following categories of Service Providers may collect data on our behalf, receive, or access personal
        information:
      </Paragraph>
      <List>
        <ListItem>The hosting service providers,</ListItem>
        <ListItem>The analytics providers,</ListItem>
        <ListItem>
          The professional advisors, agents and the service providers, such as auditors, lawyers, consultants,
          accountants and insurers.
        </ListItem>
      </List>
      <SubTitle>Legal, Compliance and Regulatory Purposes</SubTitle>
      <Paragraph>We may share personal information if we believe that it is necessary to:</Paragraph>
      <List>
        <ListItem>Comply with a law, regulation, legal process, or legitimate governmental request;</ListItem>
        <ListItem>
          Protect the safety or security of the Sky Strife Services, users of the Sky Strife Services, or any person;
        </ListItem>
        <ListItem>Investigate, prevent, or take action regarding illegal or suspected illegal activities;</ListItem>
        <ListItem>
          Prevent spam, abuse, fraud, or other malicious activity of actors using or accessing the Sky Strife Services;
          or
        </ListItem>
        <ListItem>
          Protect our rights or property or the rights or property of those who use the Sky Strife Services.
        </ListItem>
      </List>
      <SubTitle>5. How Long We Retain Your Personal Information</SubTitle>
      <Paragraph>
        We retain personal information for the purposes stated in this Privacy Policy and as required under applicable
        law. To determine how long we keep personal information, we consider the amount, nature, and sensitivity of
        personal information, the reasons for which we collect and process the information, and applicable legal
        requirements.
      </Paragraph>
      <SubTitle>6. Children&apos;s Personal Information</SubTitle>
      <Paragraph>
        The Sky Strife Services are not intended for use by anyone younger than the age of 18 or under the applicable
        legal age of their relevant country. We do not knowingly collect personal information from children younger than
        the age of 18 without the consent of a parent or legal guardian, as required under applicable law. If you learn
        or believe that a child under the age of 18 has provided us with personal information, please contact us using
        the methods provided in the “Contact Us” section of this Privacy Policy below.
      </Paragraph>
      <SubTitle>7. International Transfers</SubTitle>
      <Paragraph>
        The personal information that we collect or receive may be transferred to and processed in countries located
        outside of your country of residence to the countries where we or our third-party service providers process it.
        The data protection laws of the countries where personal information is processed may not be as comprehensive as
        or equivalent to those in your country of residence. Whenever we transfer personal information internationally,
        we take steps to protect it as required under applicable law.
      </Paragraph>
      <SubTitle>8. Changes To This Privacy Policy</SubTitle>
      <Paragraph>
        We may update this Privacy Policy from time to time. When we update this Privacy Policy, we will revise the
        “Last Updated” at the top of this Privacy Policy. Changes to this Privacy Policy are effective when they are
        posted. If we make any material changes, we will provide you with notice as required under applicable law.
        Please review this Privacy Policy periodically to ensure you are aware of any such changes.
      </Paragraph>
      <SubTitle>9. Contact Us</SubTitle>
      <Paragraph>
        If you have questions or concerns regarding this Privacy Policy, or if you have a complaint, please contact us
        at legal@lattice.xyz.
      </Paragraph>
    </div>
  </div>
);

export default PrivacyPolicy;
